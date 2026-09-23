import {
  useEffect,
  useState,
} from "react";

import LearningBlockShell from "./LearningBlockShell";

function QuizBlock({ block }) {
  const questions =
    block?.data?.questions || [];

  const allowRetry =
    block?.data?.allow_retry ??
    true;

  const [questionIndex, setQuestionIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [hasChecked, setHasChecked] =
    useState(false);

  const [isCorrect, setIsCorrect] =
    useState(false);

  /*
   * Reset quiz when a different block
   * is rendered.
   */
  useEffect(() => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setHasChecked(false);
    setIsCorrect(false);
  }, [block?.id]);

  if (!block || questions.length === 0) {
    return null;
  }

  const question =
    questions[questionIndex];

  const options =
    question?.options || [];

  const handleSelectAnswer = (
    optionIndex
  ) => {
    /*
     * Once a correct answer has been
     * checked, lock the current question.
     */
    if (hasChecked && isCorrect) {
      return;
    }

    /*
     * If retry is disabled, don't allow
     * another selection after checking.
     */
    if (
      hasChecked &&
      !allowRetry
    ) {
      return;
    }

    setSelectedAnswer(
      optionIndex
    );

    /*
     * Selecting another option after
     * a wrong answer clears feedback
     * ready for another check.
     */
    if (hasChecked) {
      setHasChecked(false);
      setIsCorrect(false);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      return;
    }

    const correct =
      selectedAnswer ===
      question.correct_answer;

    setIsCorrect(correct);
    setHasChecked(true);
  };

  const handleTryAgain = () => {
    setSelectedAnswer(null);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const handleNextQuestion = () => {
    if (
      questionIndex >=
      questions.length - 1
    ) {
      return;
    }

    setQuestionIndex(
      (current) =>
        current + 1
    );

    setSelectedAnswer(null);
    setHasChecked(false);
    setIsCorrect(false);
  };

  const isLastQuestion =
    questionIndex ===
    questions.length - 1;

  return (
    <LearningBlockShell
      title={block.title}
      icon={block.icon || "🧠"}
    >
      <div className="learning-quiz">
        {block.data?.instructions && (
          <p className="learning-quiz-instructions">
            {
              block.data
                .instructions
            }
          </p>
        )}

        {questions.length > 1 && (
          <div className="learning-quiz-progress">
            Question{" "}
            {questionIndex + 1} of{" "}
            {questions.length}
          </div>
        )}

        <h3 className="learning-quiz-question">
          {question.question}
        </h3>

        <div className="learning-quiz-options">
          {options.map(
            (
              option,
              optionIndex
            ) => {
              const selected =
                selectedAnswer ===
                optionIndex;

              let className =
                "learning-quiz-option";

              if (selected) {
                className +=
                  " selected";
              }

              if (
                hasChecked &&
                selected &&
                isCorrect
              ) {
                className +=
                  " correct";
              }

              if (
                hasChecked &&
                selected &&
                !isCorrect
              ) {
                className +=
                  " wrong";
              }

              return (
                <button
                  key={
                    optionIndex
                  }
                  type="button"
                  className={
                    className
                  }
                  onClick={() =>
                    handleSelectAnswer(
                      optionIndex
                    )
                  }
                >
                  <span className="learning-quiz-radio">
                    {selected
                      ? "●"
                      : "○"}
                  </span>

                  <span>
                    {option}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {!hasChecked && (
          <button
            type="button"
            className="learning-quiz-check"
            disabled={
              selectedAnswer ===
              null
            }
            onClick={
              handleCheckAnswer
            }
          >
            Check Answer
          </button>
        )}

        {hasChecked &&
          isCorrect && (
            <div className="learning-quiz-feedback correct">
              <strong>
                {question.correct_message ||
                  "Correct! 🎉"}
              </strong>

              {question.explanation && (
                <p>
                  {
                    question.explanation
                  }
                </p>
              )}

              {!isLastQuestion && (
                <button
                  type="button"
                  className="learning-quiz-next"
                  onClick={
                    handleNextQuestion
                  }
                >
                  Next Question →
                </button>
              )}

              {isLastQuestion && (
                <div className="learning-quiz-complete">
                  ⭐ Quiz complete!
                </div>
              )}
            </div>
          )}

        {hasChecked &&
          !isCorrect && (
            <div className="learning-quiz-feedback wrong">
              <strong>
                {question.wrong_message ||
                  "Not quite right. Try again."}
              </strong>

              {allowRetry ? (
                <button
                  type="button"
                  className="learning-quiz-retry"
                  onClick={
                    handleTryAgain
                  }
                >
                  Try Again
                </button>
              ) : (
                question.explanation && (
                  <p>
                    {
                      question.explanation
                    }
                  </p>
                )
              )}
            </div>
          )}
      </div>
    </LearningBlockShell>
  );
}

export default QuizBlock;