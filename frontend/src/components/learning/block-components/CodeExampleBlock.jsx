import {
  useEffect,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeExampleBlock({
  block,
}) {
  const data =
    block?.data || {};

  /*
   * =========================================
   * Examples
   * =========================================
   */

  const examples =
    Array.isArray(data.examples)
      ? data.examples.filter(
          (example) =>
            example &&
            (
              example.code ||
              example.label ||
              example.language
            )
        )
      : [];

  /*
   * Backward compatibility
   *
   * Older CodeExampleBlocks may still contain
   * language/code/etc. directly in block.data.
   * Convert that structure into one example.
   */
  const legacyExample =
    data.code
      ? {
          label:
            data.language ||
            "Code",

          language:
            data.language ||
            "text",

          code:
            data.code ||
            "",

          command:
            data.command ||
            "",

          output:
            data.output ||
            "",

          explanation:
            data.explanation ||
            "",
        }
      : null;

  const availableExamples =
    examples.length > 0
      ? examples
      : legacyExample
      ? [legacyExample]
      : [];

  /*
   * =========================================
   * State
   * =========================================
   */

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const [
    hasRun,
    setHasRun,
  ] = useState(false);

  /*
   * =========================================
   * Configuration
   * =========================================
   */

  const showTabs =
    availableExamples.length > 1;

  /*
   * New blocks use show_run_button.
   *
   * For older blocks where the setting does
   * not exist, preserve the previous behaviour
   * when command/output has been configured.
   */
  const configuredShowRun =
    data.show_run_button;

  const currentExample =
    availableExamples[
      selectedIndex
    ] ||
    availableExamples[0] ||
    null;

  const showRun =
    configuredShowRun !==
    undefined
      ? Boolean(
          configuredShowRun
        )
      : Boolean(
          currentExample?.command ||
          currentExample?.output
        );

  const runButtonLabel =
    data.run_button_label ||
    "▶ Run it";

  const outputPlaceholder =
    data.output_placeholder ||
    "Press run!";

  /*
   * =========================================
   * Keep selected example valid
   * =========================================
   */

  useEffect(() => {
    if (
      selectedIndex >=
      availableExamples.length
    ) {
      setSelectedIndex(0);
    }
  }, [
    selectedIndex,
    availableExamples.length,
  ]);

  /*
   * Reset when a different learning block
   * is rendered.
   */
  useEffect(() => {
    setSelectedIndex(0);
    setHasRun(false);
  }, [block?.id]);

  /*
   * =========================================
   * Select example
   * =========================================
   */

  const handleSelectExample = (
    index
  ) => {
    setSelectedIndex(index);

    /*
     * Code Quest behaviour:
     * changing language resets the terminal.
     */
    setHasRun(false);
  };

  /*
   * =========================================
   * Run simulated example
   * =========================================
   */

  const handleRun = () => {
    setHasRun(true);
  };

  /*
   * =========================================
   * Empty state
   * =========================================
   */

  if (
    availableExamples.length ===
    0
  ) {
    return (
      <LearningBlockShell
        title={block?.title}
        icon={block?.icon}
        subtitle={data.subtitle}
        className="code-example-block"
      >
        {data.description && (
          <LearningText
            text={
              data.description
            }
            className="code-example-description"
          />
        )}

        <div className="block-empty">
          No code example has
          been configured yet.
        </div>
      </LearningBlockShell>
    );
  }

  /*
   * =========================================
   * Current example
   * =========================================
   */

  const code =
    String(
      currentExample?.code ||
      ""
    );

  const language =
    currentExample?.language ||
    "text";

  const languageLabel =
    currentExample?.label ||
    currentExample?.language ||
    "Code";

  const command =
    currentExample?.command ||
    "";

  const output =
    currentExample?.output ||
    "";

  const explanation =
    currentExample?.explanation ||
    "";

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="code-example-block"
    >
      {data.description && (
        <LearningText
          text={
            data.description
          }
          className="code-example-description"
        />
      )}

      {/* =====================================
          Example Tabs
          Only shown when there is more
          than one example.
      ====================================== */}

      {showTabs && (
        <div
          className="code-example-tabs"
          role="tablist"
          aria-label="Code examples"
        >
          {availableExamples.map(
            (
              example,
              index
            ) => {
              const isSelected =
                index ===
                selectedIndex;

              const label =
                example.label ||
                example.language ||
                `Example ${
                  index + 1
                }`;

              return (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={
                    isSelected
                  }
                  className={
                    `code-example-tab${
                      isSelected
                        ? " is-active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    handleSelectExample(
                      index
                    )
                  }
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
      )}

      {/* =====================================
          Code
      ====================================== */}

      <div className="code-example-wrapper">
        <div className="code-example-toolbar">
          <span className="code-example-language">
            {languageLabel}
          </span>
        </div>

        <div className="code-example-syntax">
          <SyntaxHighlighter
            language={language}
            style={vscDarkPlus}
            showLineNumbers={true}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              padding: "18px",
              background:
                "#1e1e1e",
              borderRadius:
                "0 0 14px 14px",
              fontSize: "14px",
              lineHeight: "1.65",
            }}
            codeTagProps={{
              style: {
                fontFamily:
                  'Consolas, Monaco, "Courier New", monospace',
              },
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* =====================================
          Simulated Run / Output
      ====================================== */}

      {showRun && (
        <div className="code-example-run-section">
          <div className="code-example-run-actions">
            <button
              type="button"
              className="block-button block-button--primary"
              onClick={
                handleRun
              }
            >
              {runButtonLabel}
            </button>
          </div>

          <div
            className="code-example-terminal"
            aria-live="polite"
          >
            {!hasRun ? (
              <span className="code-example-terminal-placeholder">
                {
                  outputPlaceholder
                }
              </span>
            ) : (
              <>
                {command && (
                  <div className="code-example-terminal-command">
                    <span className="code-example-terminal-prompt">
                      $
                    </span>{" "}
                    {command}
                  </div>
                )}

                {output && (
                  <div className="code-example-terminal-output">
                    {output}
                  </div>
                )}

                {!command &&
                  !output && (
                    <div className="code-example-terminal-placeholder">
                      No simulated
                      output has been
                      configured.
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}

      {/* =====================================
          Explanation
      ====================================== */}

      {explanation && (
        <div className="code-example-explanation">
          <span
            className="code-example-explanation-icon"
            aria-hidden="true"
          >
            💡
          </span>

          <LearningText
            text={explanation}
            className="code-example-explanation-text"
          />
        </div>
      )}
    </LearningBlockShell>
  );
}

export default CodeExampleBlock;