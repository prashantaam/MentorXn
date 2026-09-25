import {
  useEffect,
  useMemo,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

const toBoolean = (
  value,
  defaultValue = false
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return defaultValue;
  }

  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
};

const shuffleArray = (items) => {
  const result = [...items];

  for (
    let i = result.length - 1;
    i > 0;
    i -= 1
  ) {
    const randomIndex =
      Math.floor(
        Math.random() *
          (i + 1)
      );

    [
      result[i],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[i],
    ];
  }

  return result;
};

function QuizBlock({ block }) {
  const data =
    block?.data || {};

  /*
   * =========================================
   * Questions
   * =========================================
   */

  const sourceQuestions =
    useMemo(
      () =>
        Array.isArray(
          data.questions
        )
          ? data.questions
          : [],
      [data.questions]
    );

  /*
   * =========================================
   * Options
   * =========================================
   */

  const shuffleQuestions =
    toBoolean(
      data.shuffle_questions ??
        data.shuffleQuestions,
      false
    );

  const shuffleAnswers =
    toBoolean(
      data.shuffle_answers ??
        data.shuffleAnswers,
      true
    );

  const showQuestionNumbers =
    toBoolean(
      data.show_question_numbers ??
        data.showQuestionNumbers,
      true
    );

  const retryWrongAnswers =
    toBoolean(
      data.retry_wrong_answers ??
        data.retryWrongAnswers,
      true
    );

  /*
   * =========================================
   * State
   * =========================================
   */

  const [
    questionOrder,
    setQuestionOrder,
  ] = useState([]);

  const [
    answerOrders,
    setAnswerOrders,
  ] = useState({});

  const [
    questionStates,
    setQuestionStates,
  ] = useState({});

  const [
    currentPosition,
    setCurrentPosition,
  ] = useState(0);

  const [
    quizComplete,
    setQuizComplete,
  ] = useState(false);

  /*
   * =========================================
   * Initialise Quiz
   * =========================================
   */

  useEffect(() => {
    let questionIndexes =
      sourceQuestions.map(
        (_, index) => index
      );

    if (shuffleQuestions) {
      questionIndexes =
        shuffleArray(
          questionIndexes
        );
    }

    const newAnswerOrders =
      {};

    sourceQuestions.forEach(
      (
        question,
        questionIndex
      ) => {
        const answers =
          Array.isArray(
            question?.answers
          )
            ? question.answers
            : [];

        let answerIndexes =
          answers.map(
            (_, index) =>
              index
          );

        if (shuffleAnswers) {
          answerIndexes =
            shuffleArray(
              answerIndexes
            );
        }

        newAnswerOrders[
          questionIndex
        ] = answerIndexes;
      }
    );

    setQuestionOrder(
      questionIndexes
    );

    setAnswerOrders(
      newAnswerOrders
    );

    setQuestionStates({});

    setCurrentPosition(0);

    setQuizComplete(false);
  }, [
    sourceQuestions,
    shuffleQuestions,
    shuffleAnswers,
  ]);

  /*
   * =========================================
   * Current Question
   * =========================================
   */

  const totalQuestions =
    sourceQuestions.length;

  const currentQuestionIndex =
    questionOrder[
      currentPosition
    ];

  const currentQuestion =
    currentQuestionIndex !==
    undefined
      ? sourceQuestions[
          currentQuestionIndex
        ]
      : null;

  const answers =
    Array.isArray(
      currentQuestion?.answers
    )
      ? currentQuestion.answers
      : [];

  const answerOrder =
    currentQuestionIndex !==
    undefined
      ? answerOrders[
          currentQuestionIndex
        ] ||
        answers.map(
          (_, index) =>
            index
        )
      : [];

  const currentState =
    currentQuestionIndex !==
    undefined
      ? questionStates[
          currentQuestionIndex
        ] || {}
      : {};

  const solved =
    Boolean(
      currentState.solved
    );

  const locked =
    Boolean(
      currentState.locked
    );

  const wrongAnswers =
    Array.isArray(
      currentState.wrongAnswers
    )
      ? currentState.wrongAnswers
      : [];

  const hasWrongAnswer =
    wrongAnswers.length > 0;

  const questionFinished =
    solved || locked;

  const isLastQuestion =
    currentPosition ===
    totalQuestions - 1;

  /*
   * =========================================
   * Answer Question
   * =========================================
   */

  const handleAnswer = (
    answerIndex
  ) => {
    if (
      currentQuestionIndex ===
        undefined ||
      !currentQuestion
    ) {
      return;
    }

    const answer =
      answers[answerIndex];

    if (!answer) {
      return;
    }

    if (
      solved ||
      locked
    ) {
      return;
    }

    const isCorrect =
      toBoolean(
        answer.correct ??
          answer.is_correct ??
          answer.isCorrect,
        false
      );

    /*
     * Correct answer
     */

    if (isCorrect) {
      setQuestionStates(
        (current) => ({
          ...current,

          [currentQuestionIndex]:
            {
              ...current[
                currentQuestionIndex
              ],

              solved: true,

              selectedAnswer:
                answerIndex,
            },
        })
      );

      return;
    }

    /*
     * Wrong answer
     */

    setQuestionStates(
      (current) => {
        const previous =
          current[
            currentQuestionIndex
          ] || {};

        const previousWrong =
          Array.isArray(
            previous.wrongAnswers
          )
            ? previous.wrongAnswers
            : [];

        return {
          ...current,

          [currentQuestionIndex]:
            {
              ...previous,

              wrongAnswers: [
                ...new Set([
                  ...previousWrong,
                  answerIndex,
                ]),
              ],

              locked:
                !retryWrongAnswers,
            },
        };
      }
    );
  };

  /*
   * =========================================
   * Next Question
   * =========================================
   */

  const handleNextQuestion =
    () => {
      if (
        !questionFinished
      ) {
        return;
      }

      if (isLastQuestion) {
        setQuizComplete(true);
        return;
      }

      setCurrentPosition(
        (current) =>
          current + 1
      );
    };

  /*
   * =========================================
   * Empty Quiz
   * =========================================
   */

  if (
    sourceQuestions.length ===
    0
  ) {
    return (
      <LearningBlockShell
        title={block?.title}
        icon={block?.icon}
        className="quiz-block"
      >
        <div className="quiz-block-empty">
          No quiz questions have
          been added yet.
        </div>
      </LearningBlockShell>
    );
  }

  /*
   * =========================================
   * Completed Quiz
   * =========================================
   */

  if (quizComplete) {
    return (
      <LearningBlockShell
        title={block?.title}
        icon={block?.icon}
        className="quiz-block"
      >
        <div className="quiz-block-complete">
          <LearningText
            text={
              data.complete_message ||
              "🎉 Great work! You completed all the questions."
            }
          />
        </div>
      </LearningBlockShell>
    );
  }

  /*
   * =========================================
   * Loading / Initialising
   * =========================================
   */

  if (!currentQuestion) {
    return (
      <LearningBlockShell
        title={block?.title}
        icon={block?.icon}
        className="quiz-block"
      >
        <div className="quiz-block-empty">
          Preparing quiz...
        </div>
      </LearningBlockShell>
    );
  }

  /*
   * =========================================
   * Quiz
   * =========================================
   */

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      className="quiz-block"
    >
      {data.subtitle && (
        <LearningText
          text={
            data.subtitle
          }
          className="quiz-block-instructions"
        />
      )}

      <section className="quiz-block-question">
        {showQuestionNumbers && (
          <div className="quiz-block-progress">
            Question{" "}
            {currentPosition + 1}{" "}
            of{" "}
            {totalQuestions}
          </div>
        )}

        <LearningText
          text={
            currentQuestion.question ||
            currentQuestion.text ||
            ""
          }
          className="quiz-block-question-text"
        />

        <div className="quiz-block-options">
          {answerOrder.map(
            (answerIndex) => {
              const answer =
                answers[
                  answerIndex
                ];

              if (!answer) {
                return null;
              }

              const wasWrong =
                wrongAnswers.includes(
                  answerIndex
                );

              const selectedCorrect =
                solved &&
                currentState
                  .selectedAnswer ===
                  answerIndex;

              const answerIsCorrect =
                toBoolean(
                  answer.correct ??
                    answer.is_correct ??
                    answer.isCorrect,
                  false
                );

              const revealCorrect =
                locked &&
                answerIsCorrect;

              let className =
                "quiz-block-option";

              if (
                selectedCorrect ||
                revealCorrect
              ) {
                className +=
                  " is-correct";
              }

              if (wasWrong) {
                className +=
                  " is-wrong";
              }

              return (
                <button
                  key={
                    `answer-${currentQuestionIndex}-${answerIndex}`
                  }
                  type="button"
                  className={
                    className
                  }
                  disabled={
                    solved ||
                    locked ||
                    (
                      wasWrong &&
                      retryWrongAnswers
                    )
                  }
                  onClick={() =>
                    handleAnswer(
                      answerIndex
                    )
                  }
                >
                  <LearningText
                    text={
                      answer.text ||
                      ""
                    }
                  />
                </button>
              );
            }
          )}
        </div>

        {/*
         * =====================================
         * Wrong - Retry Enabled
         * =====================================
         */}

        {!solved &&
          hasWrongAnswer &&
          !locked && (
            <div
              className="quiz-block-feedback quiz-block-feedback--incorrect"
              aria-live="polite"
            >
              <LearningText
                text={
                  currentQuestion.incorrect_message ||
                  "Not quite. Pick another answer, you can do it! 💪"
                }
              />
            </div>
          )}

        {/*
         * =====================================
         * Wrong - Retry Disabled
         * =====================================
         */}

        {!solved &&
          locked && (
            <div
              className="quiz-block-feedback quiz-block-feedback--incorrect"
              aria-live="polite"
            >
              <LearningText
                text={
                  currentQuestion.incorrect_message ||
                  "Not this time."
                }
              />

              {currentQuestion.explanation && (
                <LearningText
                  text={
                    currentQuestion.explanation
                  }
                  className="quiz-block-explanation"
                />
              )}
            </div>
          )}

        {/*
         * =====================================
         * Correct
         * =====================================
         */}

        {solved && (
          <div
            className="quiz-block-feedback quiz-block-feedback--correct"
            aria-live="polite"
          >
            <LearningText
              text={
                currentQuestion.correct_message ||
                "🎉 Yes!"
              }
            />

            {currentQuestion.explanation && (
              <LearningText
                text={
                  currentQuestion.explanation
                }
                className="quiz-block-explanation"
              />
            )}
          </div>
        )}

        {/*
         * =====================================
         * Next / Finish
         * =====================================
         */}

        {questionFinished && (
          <div className="quiz-block-navigation">
            <button
              type="button"
              className="quiz-block-next-button"
              onClick={
                handleNextQuestion
              }
            >
              {isLastQuestion
                ? "Finish quiz ✓"
                : "Next question →"}
            </button>
          </div>
        )}
      </section>
    </LearningBlockShell>
  );
}

export default QuizBlock;