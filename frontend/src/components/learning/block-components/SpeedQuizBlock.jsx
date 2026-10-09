import { useEffect, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Timed / speed quiz: a normal quiz with a visible countdown for
 * light time pressure. The timer starts when the student presses
 * Start, and stops cleanly when they answer, time runs out, or the
 * block goes away.
 *
 * data.questions        = [{ question, answers: [{ text, correct }] }]
 * data.seconds          = seconds per question (default 10)
 * data.shuffle_answers  = shuffle each question's answers (default on)
 * data.complete_message = shown on the result screen
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const isCorrect = (answer) => isOn(answer?.correct ?? answer?.is_correct, false);

const shuffled = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/* Idle round: answer orders ready, waiting for Start. */
function newRound(questions, shuffle, signature) {
  return {
    signature,
    phase: "idle", // idle | playing | done
    answerOrders: questions.map((question) => {
      const indexes = (question.answers || []).map((_, index) => index);
      return shuffle ? shuffled(indexes) : indexes;
    }),
    position: 0,
    endsAt: 0,
    picked: null, // answer index, or "timeout"
    timeLeft: 0,
    results: [], // true / false per question
  };
}

function SpeedQuizBlock({ block }) {
  const data = block?.data || {};
  const questions = (Array.isArray(data.questions) ? data.questions : []).filter(
    (question) =>
      String(question?.question ?? "").trim() &&
      Array.isArray(question?.answers) &&
      question.answers.length > 0
  );
  const seconds = Math.min(120, Math.max(3, Number(data.seconds) || 10));
  const shuffle = isOn(data.shuffle_answers, true);
  const signature = JSON.stringify([questions, seconds, shuffle]);

  const [round, setRound] = useState(() => newRound(questions, shuffle, signature));
  const [now, setNow] = useState(0);

  // The questions changed (e.g. in the block editor): back to the start.
  if (round.signature !== signature) {
    setRound(newRound(questions, shuffle, signature));
  }

  const waiting = round.phase === "playing" && round.picked === null;

  // Countdown: tick while a question is waiting for an answer.
  useEffect(() => {
    if (!waiting) return undefined;

    const timer = setInterval(() => {
      const time = Date.now();
      setNow(time);

      if (time >= round.endsAt) {
        setRound((current) =>
          current.picked === null && current.phase === "playing"
            ? { ...current, picked: "timeout", timeLeft: 0, results: [...current.results, false] }
            : current
        );
      }
    }, 200);

    return () => clearInterval(timer);
  }, [waiting, round.endsAt]);

  const start = () => {
    const time = Date.now();
    setNow(time);
    setRound({
      ...newRound(questions, shuffle, signature),
      phase: "playing",
      endsAt: time + seconds * 1000,
    });
  };

  // secondsLeft comes from the countdown shown on screen (ticks every 0.2s).
  const handleAnswer = (answerIndex, secondsLeft) =>
    setRound((current) => {
      if (current.picked !== null || current.phase !== "playing" || secondsLeft <= 0) {
        return current;
      }
      const right = isCorrect(questions[current.position].answers[answerIndex]);
      return {
        ...current,
        picked: answerIndex,
        timeLeft: secondsLeft,
        results: [...current.results, right],
      };
    });

  const next = () => {
    const time = Date.now();
    setNow(time);
    setRound((current) =>
      current.position >= questions.length - 1
        ? { ...current, phase: "done" }
        : { ...current, position: current.position + 1, picked: null, endsAt: time + seconds * 1000 }
    );
  };

  const shell = (children) => (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="speed-quiz-block"
    >
      {children}
    </LearningBlockShell>
  );

  if (questions.length === 0) {
    return shell(<p className="hint">Add questions in the settings panel.</p>);
  }

  /* ---------- before Start ---------- */
  if (round.phase === "idle") {
    return shell(
      <InfoPanel className="speed-quiz-block__intro">
        <p>
          ⏱️ <b>{questions.length}</b> {questions.length === 1 ? "question" : "questions"},{" "}
          <b>{seconds} seconds</b> each. Answer before the timer runs out!
        </p>
        <button type="button" className="btn" onClick={start}>
          ▶ Start
        </button>
      </InfoPanel>
    );
  }

  /* ---------- results ---------- */
  if (round.phase === "done") {
    const score = round.results.filter(Boolean).length;

    return shell(
      <InfoPanel className="speed-quiz-block__result" aria-live="polite">
        <p className="speed-quiz-block__score">
          You got <b>{score} / {questions.length}</b>
        </p>
        {data.complete_message && <LearningText text={data.complete_message} />}
        <div className="row">
          <button type="button" className="btn sm" onClick={start}>
            🔁 Play again
          </button>
        </div>
      </InfoPanel>
    );
  }

  /* ---------- a question ---------- */
  const question = questions[round.position];
  const remaining =
    round.picked === null
      ? Math.min(seconds, Math.max(0, Math.ceil((round.endsAt - now) / 1000)))
      : round.timeLeft;
  const fraction = round.picked === null ? Math.max(0, (round.endsAt - now) / (seconds * 1000)) : remaining / seconds;
  const finished = round.picked !== null;
  const timedOut = round.picked === "timeout";
  const gotItRight = finished && !timedOut && isCorrect(question.answers[round.picked]);

  return shell(
    <div className="speed-quiz-block__question" data-visual-index={round.position}>
      <div className="row speed-quiz-block__status">
        <span
          className={`tag speed-quiz-block__timer${remaining <= 3 && !finished ? " is-low" : ""}`}
          role="timer"
          aria-label={`${remaining} seconds left`}
        >
          ⏱️ {remaining}s
        </span>
        <span className="speed-quiz-block__bar" aria-hidden="true">
          <i style={{ width: `${Math.min(1, fraction) * 100}%` }} />
        </span>
        <span className="hint">
          {round.position + 1} / {questions.length}
        </span>
      </div>

      <p className="speed-quiz-block__prompt">
        <LearningText as="b" text={question.question} />
      </p>

      <div className="speed-quiz-block__options">
        {round.answerOrders[round.position].map((answerIndex) => {
          const option = question.answers[answerIndex];
          const state = !finished
            ? ""
            : answerIndex === round.picked
              ? isCorrect(option)
                ? " right"
                : " wrong"
              : isCorrect(option)
                ? " right is-answer"
                : "";

          return (
            <button
              key={answerIndex}
              type="button"
              className={`opt${state}`}
              disabled={finished}
              onClick={() => handleAnswer(answerIndex, remaining)}
            >
              <LearningText as="span" text={option?.text || ""} />
            </button>
          );
        })}
      </div>

      <div aria-live="polite">
        {finished && (
          <div className={`fb ${gotItRight ? "good" : "warn"}`}>
            {timedOut
              ? "⏰ Time's up!"
              : gotItRight
                ? `🎉 Correct, with ${round.timeLeft}s to spare!`
                : "Not quite."}
          </div>
        )}
      </div>

      {finished && (
        <div className="row">
          <button type="button" className="btn sm" onClick={next}>
            {round.position >= questions.length - 1 ? "See my result" : "Next question →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default SpeedQuizBlock;
