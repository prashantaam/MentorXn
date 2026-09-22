import { useState } from "react";

function QuizBlock({
  instructions,
  questions = [],
  passingScore = 0,
  allowRetry = true,
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [selectedAnswer, setSelectedAnswer] =
    useState(null);

  const [checked, setChecked] =
    useState(false);

  const [score, setScore] =
    useState(0);

  const [finished, setFinished] =
    useState(false);

  const [attempts, setAttempts] =
    useState({});

  if (questions.length === 0) {
    return (
      <div className="quiz-block__empty">
        No questions have been added to this quiz.
      </div>
    );
  }

  const currentQuestion =
    questions[currentQuestionIndex];

  const isCorrect =
    selectedAnswer ===
    currentQuestion.correctAnswer;

  const questionNumber =
    currentQuestionIndex + 1;

  const totalQuestions =
    questions.length;

  const currentAttempts =
    attempts[currentQuestion.id] || 0;

  const handleSelectAnswer = (
    optionIndex
  ) => {
    if (checked && isCorrect) {
      return;
    }

    setSelectedAnswer(optionIndex);

    if (checked) {
      setChecked(false);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) {
      return;
    }

    const nextAttempts = {
      ...attempts,

      [currentQuestion.id]:
        currentAttempts + 1,
    };

    setAttempts(nextAttempts);
    setChecked(true);

    if (
      selectedAnswer ===
        currentQuestion.correctAnswer &&
      currentAttempts === 0
    ) {
      setScore(
        (currentScore) =>
          currentScore + 1
      );
    }
  };

  const handleTryAgain = () => {
    if (!allowRetry) {
      handleNextQuestion();
      return;
    }

    setSelectedAnswer(null);
    setChecked(false);
  };

  const handleNextQuestion = () => {
    const isLastQuestion =
      currentQuestionIndex ===
      questions.length - 1;

    if (isLastQuestion) {
      setFinished(true);
      return;
    }

    setCurrentQuestionIndex(
      (currentIndex) =>
        currentIndex + 1
    );

    setSelectedAnswer(null);
    setChecked(false);
  };

  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setChecked(false);
    setScore(0);
    setFinished(false);
    setAttempts({});
  };

  if (finished) {
    const percentage =
      Math.round(
        (score / totalQuestions) *
          100
      );

    const passed =
      percentage >= passingScore;

    return (
      <div className="quiz-result">
        <div className="quiz-result__icon">
          {passed ? "🏆" : "🌱"}
        </div>

        <h3>
          {passed
            ? "Challenge Complete!"
            : "Keep Learning!"}
        </h3>

        <p>
          You scored{" "}
          <strong>
            {score}/{totalQuestions}
          </strong>{" "}
          ({percentage}%).
        </p>

        {passingScore > 0 && (
          <p className="quiz-result__passing">
            Passing score:{" "}
            {passingScore}%
          </p>
        )}

        {allowRetry && (
          <button
            type="button"
            className="quiz-button"
            onClick={
              handleRestartQuiz
            }
          >
            Try Quiz Again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="quiz-block">
      {instructions && (
        <p className="quiz-block__instructions">
          {instructions}
        </p>
      )}

      <div className="quiz-block__progress">
        <span>
          Question {questionNumber} of{" "}
          {totalQuestions}
        </span>

        <span>
          Score: {score}
        </span>
      </div>

      <div className="quiz-block__question">
        <h3>
          {currentQuestion.question}
        </h3>

        <div className="quiz-block__options">
          {currentQuestion.options.map(
            (option, optionIndex) => {
              const selected =
                selectedAnswer ===
                optionIndex;

              const correctOption =
                checked &&
                optionIndex ===
                  currentQuestion.correctAnswer;

              const wrongOption =
                checked &&
                selected &&
                !isCorrect;

              let className =
                "quiz-option";

              if (selected) {
                className +=
                  " quiz-option--selected";
              }

              if (correctOption) {
                className +=
                  " quiz-option--correct";
              }

              if (wrongOption) {
                className +=
                  " quiz-option--wrong";
              }

              return (
                <button
                  key={`${currentQuestion.id}-${optionIndex}`}
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
                  <span className="quiz-option__marker">
                    {String.fromCharCode(
                      65 +
                        optionIndex
                    )}
                  </span>

                  <span>
                    {option}
                  </span>
                </button>
              );
            }
          )}
        </div>
      </div>

      {!checked && (
        <button
          type="button"
          className="quiz-button"
          disabled={
            selectedAnswer === null
          }
          onClick={
            handleCheckAnswer
          }
        >
          Check Answer
        </button>
      )}

      {checked && isCorrect && (
        <div className="quiz-feedback quiz-feedback--correct">
          <strong>
            {currentQuestion.correctMessage ||
              "Correct! 🎉"}
          </strong>

          {currentQuestion.explanation && (
            <p>
              {
                currentQuestion.explanation
              }
            </p>
          )}

          <button
            type="button"
            className="quiz-button"
            onClick={
              handleNextQuestion
            }
          >
            {questionNumber ===
            totalQuestions
              ? "See Results"
              : "Next Question →"}
          </button>
        </div>
      )}

      {checked && !isCorrect && (
        <div className="quiz-feedback quiz-feedback--wrong">
          <strong>
            {currentQuestion.wrongMessage ||
              "Not quite right. Try again."}
          </strong>

          {allowRetry ? (
            <button
              type="button"
              className="quiz-button quiz-button--secondary"
              onClick={
                handleTryAgain
              }
            >
              Try Again
            </button>
          ) : (
            <button
              type="button"
              className="quiz-button quiz-button--secondary"
              onClick={
                handleNextQuestion
              }
            >
              Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default QuizBlock;