import {
  useEffect,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";


function ProcessFlowBlock({
  block,
}) {
  const data =
    block?.data || {};

  const steps =
    Array.isArray(data.steps)
      ? data.steps
      : [];

  const startMessage =
    data.start_message ||
    "Press **Next step** to start.";

  const nextButtonLabel =
    data.next_button_label ||
    "▶ Next step";

  const restartButtonLabel =
    data.restart_button_label ||
    "↺ Restart";

  /*
   * -1 means the process has
   * not started yet.
   *
   * 0 = first step
   * 1 = second step
   * etc.
   */
  const [
    currentStep,
    setCurrentStep,
  ] = useState(-1);

  /*
   * Reset the flow if the teacher
   * changes the block or its steps.
   */
  useEffect(() => {
    setCurrentStep(-1);
  }, [
    block?.id,
    steps.length,
  ]);

  const handleNext = () => {
    if (steps.length === 0) {
      return;
    }

    setCurrentStep(
      (previousStep) =>
        Math.min(
          previousStep + 1,
          steps.length - 1
        )
    );
  };

  const handleRestart = () => {
    setCurrentStep(-1);
  };

  const hasStarted =
    currentStep >= 0;

  const hasFinished =
    steps.length > 0 &&
    currentStep >=
      steps.length - 1;

  const activeStep =
    hasStarted
      ? steps[currentStep]
      : null;

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="process-flow-block"
    >
      {steps.length > 0 ? (
        <>
          <div
            className="process-flow"
            aria-label="Process steps"
          >
            {steps.map(
              (
                step,
                index
              ) => {
                const isCurrent =
                  index ===
                  currentStep;

                const isPast =
                  hasStarted &&
                  index <
                    currentStep;

                const stateClass =
                  isCurrent
                    ? " is-current"
                    : isPast
                      ? " is-past"
                      : "";

                return (
                  <div
                    key={`process-step-${index}`}
                    className="process-flow-item"
                  >
                    <div
                      className={
                        `process-flow-stage${stateClass}`
                      }
                      aria-current={
                        isCurrent
                          ? "step"
                          : undefined
                      }
                    >
                      {step?.icon && (
                        <span
                          className="process-flow-stage-icon"
                          aria-hidden="true"
                        >
                          {step.icon}
                        </span>
                      )}

                      <LearningText
                        text={
                          step?.title ||
                          `Step ${index + 1}`
                        }
                        className="process-flow-stage-title"
                      />

                      {step?.caption && (
                        <LearningText
                          text={
                            step.caption
                          }
                          className="process-flow-stage-caption"
                        />
                      )}
                    </div>

                    {index <
                      steps.length -
                        1 && (
                      <span
                        className="process-flow-arrow"
                        aria-hidden="true"
                      >
                        ➜
                      </span>
                    )}
                  </div>
                );
              }
            )}
          </div>

          <div className="process-flow-actions block-button-group">
            <button
              type="button"
              className="block-button block-button--primary"
              onClick={
                handleNext
              }
              disabled={
                hasFinished
              }
            >
              {nextButtonLabel}
            </button>

            <button
              type="button"
              className="block-button block-button--white"
              onClick={
                handleRestart
              }
              disabled={
                !hasStarted
              }
            >
              {restartButtonLabel}
            </button>
          </div>

          <div
            className="process-flow-info"
            aria-live="polite"
          >
            {activeStep ? (
              <LearningText
                text={
                  activeStep.content ||
                  ""
                }
              />
            ) : (
              <LearningText
                text={
                  startMessage
                }
              />
            )}
          </div>
        </>
      ) : (
        <div className="block-empty">
          No process steps have been configured yet.
        </div>
      )}
    </LearningBlockShell>
  );
}

export default ProcessFlowBlock;