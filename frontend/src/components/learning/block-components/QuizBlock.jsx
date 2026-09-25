import {
  useEffect,
  useMemo,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";


/*
 * =========================================================
 * MentorXn - Quiz Block
 * =========================================================
 *
 * Supports:
 *
 * - Multiple questions
 * - Multiple answers per question
 * - One correct answer
 * - Shuffled questions
 * - Shuffled answers
 * - Retry after incorrect answer
 * - Correct / incorrect feedback
 * - Explanation after correct answer
 * - LearningText formatting
 *
 * =========================================================
 */


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
    const randomIndex = Math.floor(
      Math.random() * (i + 1)
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
  const data = block?.data || {};

  const sourceQuestions = useMemo(
    () =>
      Array.isArray(data.questions)
        ? data.questions
        : [],
    [data.questions]
  );


  const shuffleQuestions = toBoolean(
    data.shuffle_questions ??
      data.shuffleQuestions,
    false
  );

  const shuffleAnswers = toBoolean(
    data.shuffle_answers ??
      data.shuffleAnswers,
    true
  );

  const showQuestionNumbers = toBoolean(
    data.show_question_numbers ??
      data.showQuestionNumbers,
    true
  );

  const retryWrongAnswers = toBoolean(
    data.retry_wrong_answers ??
      data.retryWrongAnswers,
    true
  );


  /*
   * ---------------------------------------------------------
   * Question Order
   * ---------------------------------------------------------
   */

  const [questionOrder, setQuestionOrder] =
    useState([]);

  /*
   * Stores answer order separately for every question.
   *
   * {
   *   0: [2, 0, 1],
   *   1: [1, 2, 0]
   * }
   */
  const [
    answerOrders,
    setAnswerOrders,
  ] = useState({});


  /*
   * Stores the state of each question.
   *
   * {
   *   0: {
   *     solved: true,
   *     wrongAnswers: [1]
   *   }
   * }
   */
  const [
    questionStates,
    setQuestionStates,
  ] = useState({});


  /*
   * ---------------------------------------------------------
   * Initialise / Reset Quiz
   * ---------------------------------------------------------
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

    const newAnswerOrders = {};

    sourceQuestions.forEach(
      (question, questionIndex) => {
        const answers =
          Array.isArray(
            question?.answers
          )
            ? question.answers
            : [];

        let answerIndexes =
          answers.map(
            (_, index) => index
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
  }, [
    sourceQuestions,
    shuffleQuestions,
    shuffleAnswers,
  ]);


  /*
   * ---------------------------------------------------------
   * Select Answer
   * ---------------------------------------------------------
   */

  const handleAnswer = (
    questionIndex,
    answerIndex
  ) => {
    const question =
      sourceQuestions[
        questionIndex
      ];

    if (!question) {
      return;
    }

    const answers =
      Array.isArray(
        question.answers
      )
        ? question.answers
        : [];

    const answer =
      answers[answerIndex];

    if (!answer) {
      return;
    }

    const currentState =
      questionStates[
        questionIndex
      ] || {};

    /*
     * Question already solved.
     */
    if (currentState.solved) {
      return;
    }

    const isCorrect = toBoolean(
      answer.correct ??
        answer.is_correct ??
        answer.isCorrect,
      false
    );


    /*
     * Correct Answer
     */
    if (isCorrect) {
      setQuestionStates(
        (current) => ({
          ...current,

          [questionIndex]: {
            ...current[
              questionIndex
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
     * Incorrect Answer
     */
    setQuestionStates(
      (current) => {
        const previous =
          current[
            questionIndex
          ] || {};

        const previousWrong =
          Array.isArray(
            previous.wrongAnswers
          )
            ? previous.wrongAnswers
            : [];

        return {
          ...current,

          [questionIndex]: {
            ...previous,

            wrongAnswers: [
              ...new Set([
                ...previousWrong,
                answerIndex,
              ]),
            ],

            /*
             * If retry is disabled,
             * lock the question.
             */
            locked:
              !retryWrongAnswers,
          },
        };
      }
    );
  };


  /*
   * ---------------------------------------------------------
   * Progress
   * ---------------------------------------------------------
   */

  const solvedCount =
    Object.values(
      questionStates
    ).filter(
      (state) =>
        state?.solved
    ).length;

  const totalQuestions =
    sourceQuestions.length;

  const quizComplete =
    totalQuestions > 0 &&
    solvedCount ===
      totalQuestions;


  /*
   * ---------------------------------------------------------
   * Empty State
   * ---------------------------------------------------------
   */

  if (
    sourceQuestions.length === 0
  ) {
    return (
      <LearningBlockShell
        title={block?.title}
        icon={block?.icon}
        className="quiz-block"
      >
        <div className="quiz-block-empty">
          No quiz questions have been added yet.
        </div>
      </LearningBlockShell>
    );
  }


  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      className="quiz-block"
    >

      {/* ===============================================
          Instructions
          =============================================== */}

      {data.subtitle && (
        <LearningText
          text={data.subtitle}
          className="quiz-block-instructions"
        />
      )}


      {/* ===============================================
          Progress
          =============================================== */}

      {totalQuestions > 1 && (
        <div className="quiz-block-progress">
          <span>
            {solvedCount} of{" "}
            {totalQuestions} correct
          </span>
        </div>
      )}


      {/* ===============================================
          Questions
          =============================================== */}

      <div className="quiz-block-questions">
        {questionOrder.map(
          (
            questionIndex,
            displayIndex
          ) => {
            const question =
              sourceQuestions[
                questionIndex
              ];

            if (!question) {
              return null;
            }

            const answers =
              Array.isArray(
                question.answers
              )
                ? question.answers
                : [];

            const answerOrder =
              answerOrders[
                questionIndex
              ] ||
              answers.map(
                (_, index) =>
                  index
              );

            const state =
              questionStates[
                questionIndex
              ] || {};

            const solved =
              Boolean(
                state.solved
              );

            const locked =
              Boolean(
                state.locked
              );

            const wrongAnswers =
              Array.isArray(
                state.wrongAnswers
              )
                ? state.wrongAnswers
                : [];

            const hasWrongAnswer =
              wrongAnswers.length >
              0;

            return (
              <section
                key={
                  `quiz-question-${questionIndex}`
                }
                className={
                  `quiz-block-question` +
                  `${
                    solved
                      ? " is-correct"
                      : ""
                  }`
                }
              >

                {/* Question */}

                <div className="quiz-block-question-heading">
                  {showQuestionNumbers && (
                    <span className="quiz-block-question-number">
                      {displayIndex + 1}
                    </span>
                  )}

                  <LearningText
                    text={
                      question.question ||
                      question.text ||
                      ""
                    }
                    className="quiz-block-question-text"
                  />
                </div>


                {/* Answers */}

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

                      const isCorrect =
                        toBoolean(
                          answer.correct ??
                            answer.is_correct ??
                            answer.isCorrect,
                          false
                        );

                      const wasWrong =
                        wrongAnswers.includes(
                          answerIndex
                        );

                      const selectedCorrect =
                        solved &&
                        state.selectedAnswer ===
                          answerIndex;

                      let className =
                        "quiz-block-option";

                      if (
                        selectedCorrect
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
                            `answer-${questionIndex}-${answerIndex}`
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
                              questionIndex,
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


                {/* Incorrect Feedback */}

                {!solved &&
                  hasWrongAnswer &&
                  !locked && (
                    <div
                      className="quiz-block-feedback quiz-block-feedback--incorrect"
                      aria-live="polite"
                    >
                      <LearningText
                        text={
                          question.incorrect_message ||
                          "Not quite. Pick another answer, you can do it! 💪"
                        }
                      />
                    </div>
                  )}


                {/* Locked Incorrect Feedback */}

                {!solved &&
                  locked && (
                    <div
                      className="quiz-block-feedback quiz-block-feedback--incorrect"
                      aria-live="polite"
                    >
                      <LearningText
                        text={
                          question.incorrect_message ||
                          "Not quite. Review the question and try again later."
                        }
                      />
                    </div>
                  )}


                {/* Correct Feedback */}

                {solved && (
                  <div
                    className="quiz-block-feedback quiz-block-feedback--correct"
                    aria-live="polite"
                  >
                    <LearningText
                      text={
                        question.correct_message ||
                        "🎉 Yes!"
                      }
                    />

                    {question.explanation && (
                      <LearningText
                        text={
                          question.explanation
                        }
                        className="quiz-block-explanation"
                      />
                    )}
                  </div>
                )}
              </section>
            );
          }
        )}
      </div>


      {/* ===============================================
          Quiz Complete
          =============================================== */}

      {quizComplete && (
        <div
          className="quiz-block-complete"
          aria-live="polite"
        >
          <LearningText
            text={
              data.complete_message ||
              `🎉 Great work! You completed all ${totalQuestions} questions.`
            }
          />
        </div>
      )}
    </LearningBlockShell>
  );
}


export default QuizBlock;