import { useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

/*
 * List block: rows of title · subtitle · details, with thin lines
 * between them and an optional "See: <link>" at the bottom.
 *
 * data.rows = [{
 *   title     the row's heading (older rows: text)
 *   subtitle  optional — smaller text under the title
 *   details   optional — when set, the title gets an arrow and
 *             expands to show it
 * }]
 * data.list_style = "plain" | "numbered" (1, 2, 3…) | "icons"
 *                   (older blocks: data.numbered = true → numbered)
 * data.default_icon = the icon for rows without their own (icons style)
 * row.icon          = a row's own icon (icons style), optional
 * data.see_label / data.see_url = optional footer link
 *
 * All text supports **bold**, `code` and labels like [[g:colspan]].
 */
const SAFE_URL = /^(https?:\/\/|mailto:)/i;

const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

function ListBlock({ block }) {
  const data = block?.data || {};
  const [open, setOpen] = useState(() => new Set());

  const rows = (Array.isArray(data.rows) ? data.rows : [])
    .map((row) => ({
      icon: String(row?.icon ?? "").trim(),
      title: String(row?.title ?? row?.text ?? "").trim(),
      subtitle: String(row?.subtitle ?? "").trim(),
      details: String(row?.details ?? "").trim(),
    }))
    .filter((row) => row.title || row.subtitle || row.details);

  const listStyle = ["plain", "numbered", "icons"].includes(data.list_style)
    ? data.list_style
    : isOn(data.numbered, false)
      ? "numbered"
      : "plain";
  const defaultIcon = String(data.default_icon ?? "").trim() || "✅";

  const seeLabel = String(data.see_label ?? "").trim();
  const seeUrl = String(data.see_url ?? "").trim();
  const hasLink = SAFE_URL.test(seeUrl);
  const showFooter = Boolean(seeLabel || hasLink);

  const toggle = (index) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  const renderHead = (row, index) => (
    <>
      {listStyle === "numbered" && <span className="list-block__marker list-block__number">{index + 1}.</span>}
      {listStyle === "icons" && (
        <span className="list-block__marker list-block__icon" aria-hidden="true">
          {row.icon || defaultIcon}
        </span>
      )}
      <span className="list-block__head-text">
        {row.title && <LearningText as="span" text={row.title} className="list-block__title" />}
        {row.subtitle && <LearningText as="span" text={row.subtitle} className="list-block__subtitle" />}
      </span>
    </>
  );

  return (
    <LearningBlockShell title={block?.title} icon={block?.icon} subtitle={data.subtitle} className="list-block">
      {rows.length > 0 ? (
        <div className="list-block__list">
          <ul className="list-block__rows">
            {rows.map((row, index) => {
              const isOpen = open.has(index);
              const detailsId = `list-block-details-${block?.id ?? "x"}-${index}`;

              return (
                <li
                  key={index}
                  className={`list-block__row${row.details ? " has-details" : ""}${isOpen ? " is-open" : ""}`}
                  data-visual-index={index}
                >
                  {row.details ? (
                    <>
                      <button
                        type="button"
                        className="list-block__head list-block__head--toggle"
                        aria-expanded={isOpen}
                        aria-controls={detailsId}
                        onClick={() => toggle(index)}
                      >
                        {renderHead(row, index)}
                        <span className="list-block__arrow" aria-hidden="true">
                          ›
                        </span>
                      </button>

                      {isOpen && (
                        <div id={detailsId} className="list-block__details">
                          <LearningText text={row.details} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="list-block__head">{renderHead(row, index)}</div>
                  )}
                </li>
              );
            })}
          </ul>

          {showFooter && (
            <div className="list-block__footer">
              See:{" "}
              {hasLink ? (
                <a href={seeUrl} target="_blank" rel="noopener noreferrer nofollow">
                  {seeLabel || seeUrl}
                </a>
              ) : (
                <span>{seeLabel}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="hint">Add rows in the settings panel.</p>
      )}
    </LearningBlockShell>
  );
}

export default ListBlock;
