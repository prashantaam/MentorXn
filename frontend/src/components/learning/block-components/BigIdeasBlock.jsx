import { useEffect, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import InfoPanel from "../shared/InfoPanel";
import LearningText from "../shared/LearningText";

/*
 * Big Ideas: a set of ideas, each with the same parts in every
 * display style:
 *
 *   icon · title · subtitle (short text on the card) · More details
 *
 * Display styles only change the design:
 *   cards       big icon on top, centred
 *   info_cards  icon and title on one line, left-aligned
 *   buttons     pills
 *
 * data.mode (how the ideas are shown):
 *   "click"  click an idea to see its More details below the ideas
 *   "play"   step through the ideas one at a time (▶ Next step /
 *            ↺ Restart, like Cloud Quest's "Step through the flow");
 *            the current idea's More details show below.
 *            data.auto_play: ▶ Play steps by itself, every
 *            data.play_seconds seconds (default 2)
 *   "all"    every idea in the lesson colour, nothing to click; each
 *            card shows its More details inside it
 *   (older blocks: "dynamic" = click, "static" = all)
 * More details always show in the shared dotted box.
 * data.note          one shared dotted box at the very end
 * data.dark_instructions  instructions in a black box
 */

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

/*
 * A sentence in a black box. Same formatting as everywhere else
 * (**bold**, `code`, [[g:labels]]); **bold** words show in the lesson colour.
 */
function ExampleBox({ text }) {
  return <LearningText as="div" text={text} className="code big-ideas-example" />;
}

/*
 * An idea's icon. Emoji show as they are; a number or a word
 * (e.g. "1", "N", "if") shows as a badge in the lesson colour.
 */
const PICTURE = /\p{Extended_Pictographic}|\p{Regional_Indicator}/u;

function IdeaIcon({ icon }) {
  const text = String(icon ?? "").trim();
  if (!text) return null;

  const isBadge = !PICTURE.test(text);

  return (
    <span
      className={`big-ideas-idea-icon${isBadge ? " big-ideas-badge" : ""}${
        isBadge && text.length > 2 ? " is-long" : ""
      }`}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}

/*
 * An idea's example (item.example) in a black box, where **bold**
 * words show in the lesson colour, followed by its More details —
 * both inside the dotted box (Word Quest's sentence + explanation).
 */
function IdeaDetails({ item }) {
  // <lbox> tags were briefly supported; any left in saved text are dropped.
  const details = String(item?.content ?? "").replace(/<\/?lbox>/gi, "").trim();
  const example = String(item?.example ?? "").trim();

  if (!details && !example) return null;

  return (
    <div className="big-ideas-details-wrap">
      <InfoPanel className="big-ideas-details">
        {example && <ExampleBox text={example} />}

        {details && <LearningText text={details} />}
      </InfoPanel>
    </div>
  );
}

function BigIdeasBlock({ block }) {
  const [selected, setSelected] = useState(null);

  const data = block?.data || {};
  const items = Array.isArray(data.items) ? data.items : [];

  const rawStyle = data.display_style || data.displayStyle;
  const displayStyle = ["cards", "buttons", "info_cards"].includes(rawStyle) ? rawStyle : "cards";

  /*
   * How the ideas are shown. Older values: "dynamic" = click,
   * "static" = all. Inline Cards (info_cards) saved before the
   * setting existed always showed their text, so they default to all.
   */
  const rawMode = data.mode;
  const mode =
    rawMode === "play"
      ? "play"
      : rawMode === "all" || rawMode === "static"
        ? "all"
        : rawMode === "click" || rawMode === "dynamic"
          ? "click"
          : displayStyle === "info_cards"
            ? "all"
            : "click";

  const isStatic = mode === "all";
  const isPlay = mode === "play";
  const autoPlay = isPlay && isOn(data.auto_play, false);
  const playSeconds = Math.min(30, Math.max(0.5, Number(data.play_seconds) || 2));
  const lastIndex = items.length - 1;

  /*
   * Play: step = the lit idea (-1 before starting). Starts again
   * when the ideas or the play settings change.
   */
  const playSignature = JSON.stringify([items.length, mode, autoPlay]);
  const [play, setPlay] = useState({ signature: playSignature, step: -1, running: false });
  const playIsStale = play.signature !== playSignature;

  if (playIsStale) {
    setPlay({ signature: playSignature, step: -1, running: false });
  }

  const step = playIsStale ? -1 : play.step;
  const running = !playIsStale && play.running;

  // Auto play: move on every few seconds, and stop at the last idea.
  useEffect(() => {
    if (!running) return undefined;

    const timer = setInterval(() => {
      setPlay((current) =>
        current.step >= lastIndex
          ? { ...current, running: false }
          : { ...current, step: current.step + 1, running: current.step + 1 < lastIndex }
      );
    }, playSeconds * 1000);

    return () => clearInterval(timer);
  }, [running, lastIndex, playSeconds]);

  const nextStep = () =>
    setPlay((current) => ({ ...current, step: Math.min(lastIndex, current.step + 1) }));

  const restart = () => setPlay((current) => ({ ...current, step: -1, running: false }));

  const startAuto = () =>
    setPlay((current) => {
      const from = current.step >= lastIndex ? -1 : current.step; // finished: start over
      return { ...current, step: from + 1, running: from + 1 < lastIndex };
    });

  const pauseAuto = () => setPlay((current) => ({ ...current, running: false }));

  // Clicking a card jumps to it (and pauses auto play).
  const goToStep = (index) => setPlay((current) => ({ ...current, step: index, running: false }));

  const showFlow = isOn(data.show_flow ?? data.showFlow, false);
  const openFirst = isOn(data.open_first, false);
  const note = String(data.note ?? "").trim();

  /*
   * Instructions, optionally in a black box. Older blocks kept a
   * separate black-box sentence in data.example; with no
   * instructions it is used as black-box instructions.
   */
  const legacySentence = !String(data.subtitle ?? "").trim() ? String(data.example ?? "").trim() : "";
  const instructions = String(data.subtitle ?? "").trim() || legacySentence;
  const darkInstructions = Boolean(instructions) && isOn(data.dark_instructions, Boolean(legacySentence));

  /*
   * The idea whose More details show below: the clicked one (click),
   * or the current step (play). A removed idea means none.
   */
  const chosen = selected !== null && items[selected] ? selected : null;
  const activeIndex = isStatic
    ? null
    : isPlay
      ? step >= 0 && items[step]
        ? step
        : null
      : chosen ?? (openFirst && items.length > 0 ? 0 : null);

  const renderIdea = (item, index) => {
    const title = item?.title || item?.label || `Idea ${index + 1}`;
    const subtitle = String(item?.subtitle ?? "").trim();
    const isLit = isStatic || activeIndex === index;
    // Play: ideas already passed stay clear; ones still to come are dimmed.
    const playState = isPlay ? (index < step ? " is-past" : index > step ? " is-next" : "") : "";
    const className = `big-ideas-idea big-ideas-idea--${displayStyle}${isLit ? " on" : ""}${
      isStatic ? " is-static" : isPlay ? " is-play" : ""
    }${playState}`;

    const face = (
      <>
        <IdeaIcon icon={item?.icon} />
        <LearningText as="span" text={title} className="big-ideas-idea-title" />
        {subtitle && <LearningText as="small" text={subtitle} className="big-ideas-idea-subtitle" />}
      </>
    );

    if (isStatic) {
      return (
        <article className={className}>
          {face}
          {displayStyle !== "buttons" && <IdeaDetails item={item} />}
        </article>
      );
    }

    // Play: the buttons step through the ideas, or click a card to jump to it.
    if (isPlay) {
      return (
        <button
          type="button"
          className={className}
          aria-current={activeIndex === index ? "step" : undefined}
          onClick={() => goToStep(index)}
        >
          {face}
        </button>
      );
    }

    return (
      <button
        type="button"
        className={className}
        aria-pressed={activeIndex === index}
        onClick={() => setSelected(index)}
      >
        {face}
      </button>
    );
  };

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const activeHasDetails =
    activeItem && (String(activeItem.content ?? "").trim() || String(activeItem.example ?? "").trim());

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={darkInstructions ? undefined : instructions}
      className="big-ideas-block"
    >
      {/* Instructions in a black box. Class "sub" keeps visual editing working. */}
      {darkInstructions && (
        <div className="sub big-ideas-instructions">
          <ExampleBox text={instructions} />
        </div>
      )}

      {items.length > 0 ? (
        <>
          {/* Play controls (above the ideas, like Cloud Quest). */}
          {isPlay && (
            <div className="row big-ideas-play">
              {autoPlay ? (
                running ? (
                  <button type="button" className="btn" onClick={pauseAuto}>
                    ⏸ Pause
                  </button>
                ) : (
                  <button type="button" className="btn" onClick={startAuto}>
                    ▶ {step >= lastIndex ? "Play again" : step >= 0 ? "Continue" : "Play"}
                  </button>
                )
              ) : (
                <button type="button" className="btn" onClick={nextStep} disabled={step >= lastIndex}>
                  ▶ Next step
                </button>
              )}

              <button type="button" className="btn ghost" onClick={restart} disabled={step < 0}>
                ↺ Restart
              </button>
            </div>
          )}

          <div className={`big-ideas-items big-ideas-items--${displayStyle}${showFlow ? " has-flow" : ""}`}>
            {items.map((item, index) => (
              <div key={`idea-${index}`} className="big-ideas-item-wrapper">
                {renderIdea(item, index)}

                {showFlow && index < items.length - 1 && (
                  <span className="big-ideas-flow-arrow" aria-hidden="true">
                    ➜
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* On click / Play: the active idea's More details. */}
          {!isStatic && (
            <div className="big-ideas-panel" aria-live="polite">
              {activeItem && activeHasDetails ? (
                <IdeaDetails item={activeItem} />
              ) : (
                <InfoPanel className="big-ideas-details">
                  <span className="hint">
                    {activeItem
                      ? "No more details for this one."
                      : isPlay
                        ? autoPlay
                          ? "Press ▶ Play to begin."
                          : "Press ▶ Next step to begin."
                        : "👆 Select an idea to explore it."}
                  </span>
                </InfoPanel>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="block-empty">No ideas have been configured yet.</div>
      )}

      {/* One shared note, at the very end. */}
      {note && <InfoPanel className="big-ideas-note" text={note} />}
    </LearningBlockShell>
  );
}

export default BigIdeasBlock;
