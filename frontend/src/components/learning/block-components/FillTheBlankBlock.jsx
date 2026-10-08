import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * Fill the blank (was "Word bank (cloze fill-in)"): sentences with
 * blanks. Students either tap words from a word bank into the blanks
 * or type the missing words, depending on the teacher's settings.
 *
 * data.sentences     = [{ sentence: "It {{is raining|'s raining}}.", distractors: "rains", why }]
 *                      ({{word}} = a blank; | separates other accepted
 *                      answers when typing — the word bank uses the first)
 * data.answer_style  = "bank" (tap words, default) | "typed" (type them)
 * data.sentence_count = "multiple" (default) | "single" (first sentence only)
 * data.layout        = "one_by_one" (Next sentence, default) | "all" (all at once)
 * data.sentence / data.distractors = older single-sentence blocks
 * data.shuffle_bank  = shuffle the word chips (default on)
 * data.dark_sentence = sentence in a dark box, like Word Quest's
 *                      "Pick the correct form" (default off)
 * data.correct_message / data.incorrect_message
 */
const BLANK = /\{\{([^{}]+?)\}\}/g;

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const sameWord = (a, b) =>
  String(a ?? "").trim().toLowerCase() === String(b ?? "").trim().toLowerCase();

const shuffled = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/* "It {{is|'s}} wet." -> [{ text: "It " }, { blank: 0, accepted: ["is", "'s"] }, { text: " wet." }] */
function parseSentence(sentence) {
  const source = String(sentence || "");
  const parts = [];
  let lastIndex = 0;
  let blankCount = 0;

  for (const match of source.matchAll(BLANK)) {
    const accepted = match[1]
      .split("|")
      .map((answer) => answer.trim())
      .filter(Boolean);
    if (accepted.length === 0) continue;

    if (match.index > lastIndex) {
      parts.push({ text: source.slice(lastIndex, match.index) });
    }
    parts.push({ blank: blankCount, accepted });
    blankCount += 1;
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    parts.push({ text: source.slice(lastIndex) });
  }

  return parts;
}

/* One sentence ready to play: its parts, answers and word chips. */
function buildItem(raw, index) {
  const parts = parseSentence(raw?.sentence);
  const accepted = parts.filter((part) => part.blank !== undefined).map((part) => part.accepted);
  const distractors = String(raw?.distractors || "")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean);

  return {
    index,
    parts,
    accepted,
    // The word bank holds each blank's first answer plus the wrong words.
    chips: [...accepted.map((answers) => answers[0]), ...distractors],
    why: String(raw?.why ?? "").trim(),
  };
}

/* A fresh go at one sentence. filled[blank] = chip index (bank) or text (typed). */
function newRound(item, typed, shuffle) {
  const ids = item.chips.map((_, index) => index);

  return {
    bankOrder: shuffle ? shuffled(ids) : ids,
    filled: Array(item.accepted.length).fill(typed ? "" : null),
    checked: false,
    tries: 0,
  };
}

function FillTheBlankBlock({ block }) {
  const data = block?.data || {};

  // Older blocks have one sentence in data.sentence.
  const rawSentences =
    Array.isArray(data.sentences) && data.sentences.length > 0
      ? data.sentences
      : [{ sentence: data.sentence, distractors: data.distractors }];

  const allItems = rawSentences.map(buildItem).filter((item) => item.accepted.length > 0);
  const items = data.sentence_count === "single" ? allItems.slice(0, 1) : allItems;
  const typed = data.answer_style === "typed";
  const showAll = data.layout === "all" && items.length > 1;
  const shuffle = isOn(data.shuffle_bank, true);
  const darkSentence = isOn(data.dark_sentence, false);
  const signature = JSON.stringify([items.map((item) => [item.parts, item.chips]), typed, showAll, shuffle]);

  const fresh = () => ({
    signature,
    current: 0,
    firstTry: 0,
    finished: false,
    rounds: items.map((item) => newRound(item, typed, shuffle)),
  });

  const [state, setState] = useState(fresh);
  const isStale = state.signature !== signature;

  // The sentences or settings changed (e.g. in the block editor): start again.
  if (isStale) {
    setState(fresh());
  }

  const view = isStale ? fresh() : state;
  const hasMany = items.length > 1;

  /* ---------- per-sentence helpers ---------- */

  const isFilled = (value) => (typed ? String(value).trim() !== "" : value !== null);
  const allFilledIn = (round) => round.filled.every(isFilled);

  const blankIsRight = (item, round, blank) => {
    const value = typed ? round.filled[blank] : item.chips[round.filled[blank]];
    return item.accepted[blank].some((answer) => sameWord(answer, value));
  };

  const roundIsRight = (item, round) =>
    allFilledIn(round) && item.accepted.every((_, blank) => blankIsRight(item, round, blank));

  const updateRound = (roundIndex, change) =>
    setState((current) => ({
      ...current,
      rounds: current.rounds.map((round, index) => (index === roundIndex ? change(round) : round)),
    }));

  const placeChip = (roundIndex, chip) =>
    updateRound(roundIndex, (round) => {
      const slot = round.filled.indexOf(null);
      if (slot === -1 || round.filled.includes(chip)) return round;
      const filled = [...round.filled];
      filled[slot] = chip;
      return { ...round, filled, checked: false };
    });

  const clearBlank = (roundIndex, blank) =>
    updateRound(roundIndex, (round) => {
      if (round.filled[blank] === null) return round;
      const filled = [...round.filled];
      filled[blank] = null;
      return { ...round, filled, checked: false };
    });

  const typeBlank = (roundIndex, blank, value) =>
    updateRound(roundIndex, (round) => {
      const filled = [...round.filled];
      filled[blank] = value;
      return { ...round, filled, checked: false };
    });

  /* Check one sentence (one by one) or every unsolved one (all at once). */
  const check = (indexes) =>
    setState((current) => {
      let firstTry = current.firstTry;
      const rounds = current.rounds.map((round, index) => {
        if (!indexes.includes(index)) return round;
        if (round.checked && roundIsRight(items[index], round)) return round; // already solved
        if (roundIsRight(items[index], round) && round.tries === 0) firstTry += 1;
        return { ...round, checked: true, tries: round.tries + 1 };
      });
      return { ...current, rounds, firstTry };
    });

  const resetRound = (roundIndex) =>
    updateRound(roundIndex, (round) => ({ ...newRound(items[roundIndex], typed, shuffle), tries: round.tries }));

  const next = () =>
    setState((current) =>
      current.current >= items.length - 1
        ? { ...current, finished: true }
        : { ...current, current: current.current + 1 }
    );

  const restart = () => setState(fresh());

  /* ---------- one sentence ---------- */

  const renderSentence = (item, roundIndex, { showProgress }) => {
    const round = view.rounds[roundIndex];
    const solved = round.checked && roundIsRight(item, round);
    const used = new Set(typed ? [] : round.filled.filter((chip) => chip !== null));
    const full = allFilledIn(round);

    return (
      <div
        key={item.index}
        className={`fill-the-blank-block__item${showAll ? " fill-the-blank-block__item--listed" : ""}`}
        data-visual-index={item.index}
      >
        {showProgress && (
          <span className="tag fill-the-blank-block__progress">
            Sentence {roundIndex + 1} of {items.length}
          </span>
        )}

        <p className={`fill-the-blank-block__sentence${darkSentence ? " code fill-the-blank-block__sentence--dark" : ""}`}>
          {showAll && <span className="fill-the-blank-block__number">{roundIndex + 1}.</span>}

          {item.parts.map((part, index) => {
            if (part.text !== undefined) {
              return <LearningText key={index} as="span" text={part.text} />;
            }

            const value = round.filled[part.blank];
            const mark =
              round.checked && isFilled(value) ? (blankIsRight(item, round, part.blank) ? " good" : " bad") : "";

            if (typed) {
              const longest = Math.max(...part.accepted.map((answer) => answer.length), 4);
              return (
                <input
                  key={index}
                  type="text"
                  className={`tag fill-the-blank-block__blank fill-the-blank-block__input${mark}`}
                  style={{ width: `${longest + 2}ch` }}
                  value={value}
                  disabled={solved}
                  autoComplete="off"
                  spellCheck={false}
                  aria-label={`Blank ${part.blank + 1}`}
                  onChange={(event) => typeBlank(roundIndex, part.blank, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !showAll && full) check([roundIndex]);
                  }}
                />
              );
            }

            return (
              <button
                key={index}
                type="button"
                className={`tag fill-the-blank-block__blank${value === null ? " is-empty" : ""}${mark}`}
                aria-label={
                  value === null
                    ? `Blank ${part.blank + 1}, empty`
                    : `Blank ${part.blank + 1}: ${item.chips[value]}. Tap to send it back`
                }
                disabled={solved}
                onClick={() => clearBlank(roundIndex, part.blank)}
              >
                {value === null ? "____" : item.chips[value]}
              </button>
            );
          })}
        </p>

        {!typed && (
          <div className="chips fill-the-blank-block__bank" role="group" aria-label="Word bank">
            {round.bankOrder.map((chip) => (
              <button
                key={chip}
                type="button"
                className={`chip${used.has(chip) ? " on" : ""}`}
                disabled={used.has(chip) || full || solved}
                onClick={() => placeChip(roundIndex, chip)}
              >
                {item.chips[chip]}
              </button>
            ))}
          </div>
        )}

        {/* All at once: a short result under each sentence. */}
        {showAll && round.checked && (
          <div className={`fb ${solved ? "good" : "warn"}`}>
            {solved ? "✅ Correct" : "❌ Not quite — fix the red word"}
            {solved && item.why && (
              <>
                {" — "}
                <LearningText as="span" text={item.why} />
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const message = (right) => (
    <LearningText
      as="span"
      text={
        right
          ? data.correct_message || "🎉 Correct!"
          : data.incorrect_message ||
            (typed
              ? "Not quite — fix the red answers, then try again."
              : "Not quite — tap a red word to send it back, then try again.")
      }
    />
  );

  /* ---------- layouts ---------- */

  const shell = (children) => (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className={`fill-the-blank-block${typed ? " fill-the-blank-block--typed" : ""}`}
    >
      {children}
    </LearningBlockShell>
  );

  if (items.length === 0) {
    return shell(<p className="hint">Add a sentence with {"{{blanks}}"} in the settings panel.</p>);
  }

  if (showAll) {
    const allIndexes = items.map((_, index) => index);
    const everyFilled = view.rounds.every(allFilledIn);
    const anyChecked = view.rounds.some((round) => round.checked);
    const rightCount = items.filter((item, index) => {
      const round = view.rounds[index];
      return round.checked && roundIsRight(item, round);
    }).length;
    const allRight = rightCount === items.length;

    return shell(
      <>
        <div className="fill-the-blank-block__list">
          {items.map((item, index) => renderSentence(item, index, { showProgress: false }))}
        </div>

        <div className="row">
          {!allRight && (
            <>
              <button type="button" className="btn sm ghost" onClick={restart}>
                ↺ Reset
              </button>
              <button type="button" className="btn sm" disabled={!everyFilled} onClick={() => check(allIndexes)}>
                ✅ Check all
              </button>
            </>
          )}
          {allRight && (
            <button type="button" className="btn sm ghost" onClick={restart}>
              ↺ Start again
            </button>
          )}
        </div>

        <div aria-live="polite">
          {anyChecked && (
            <div className={`fb ${allRight ? "good" : "warn"}`}>
              {message(allRight)}{" "}
              <b>
                ({rightCount} / {items.length} right)
              </b>
            </div>
          )}
        </div>
      </>
    );
  }

  // One by one.
  if (view.finished) {
    return shell(
      <div className="fill-the-blank-block__done" aria-live="polite">
        <div className="big">🏆</div>
        <p>
          All {items.length} sentences done! Right on the first try:{" "}
          <b>
            {view.firstTry} / {items.length}
          </b>
        </p>
        <button type="button" className="btn sm" onClick={restart}>
          ↺ Start again
        </button>
      </div>
    );
  }

  const roundIndex = Math.min(view.current, items.length - 1);
  const item = items[roundIndex];
  const round = view.rounds[roundIndex];
  const right = roundIsRight(item, round);
  const solved = round.checked && right;
  const isLast = roundIndex >= items.length - 1;

  return shell(
    <>
      {renderSentence(item, roundIndex, { showProgress: hasMany })}

      <div className="row">
        {!solved && (
          <>
            <button type="button" className="btn sm ghost" onClick={() => resetRound(roundIndex)}>
              ↺ Reset
            </button>
            <button
              type="button"
              className="btn sm"
              disabled={!allFilledIn(round)}
              onClick={() => check([roundIndex])}
            >
              ✅ Check
            </button>
          </>
        )}

        {hasMany && round.checked && (
          <button type="button" className={`btn sm${solved ? "" : " ghost"}`} onClick={next}>
            {isLast ? "🏁 Finish" : "▶ Next sentence"}
          </button>
        )}
      </div>

      <div aria-live="polite">
        {round.checked && (
          <div className={`fb ${right ? "good" : "warn"}`}>
            {message(right)}
            {right && item.why && (
              <>
                {" "}
                <LearningText as="span" text={item.why} />
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default FillTheBlankBlock;
