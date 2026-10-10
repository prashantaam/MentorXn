import LearningText from "./LearningText";

/*
 * ExtraInfo: an extra block-level section of bullet points, a
 * numbered list or a table (e.g. Word Quest's "Direct → Reported"
 * table under its chips).
 *
 *   style   "bullets" | "numbered" | "table" (anything else: hidden)
 *   title   optional heading
 *   content one line per point / row. For a table, cells are
 *           separated by | and the first row is the header:
 *
 *             Direct | Reported
 *             "I am tired." | She said (that) she was tired.
 *
 * Every point and cell supports **bold**, `code` and [[g:labels]].
 */
const toLines = (text) =>
  String(text ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

function ExtraInfo({ style, title, content, className = "" }) {
  const lines = toLines(content);
  if (!["bullets", "numbered", "table"].includes(style) || lines.length === 0) return null;

  const heading = String(title ?? "").trim();

  let body;

  if (style === "table") {
    const rows = lines.map((line) => line.split("|").map((cell) => cell.trim()));
    const columns = Math.max(...rows.map((row) => row.length));
    const pad = (row) => [...row, ...Array(columns - row.length).fill("")];
    const [head, ...rest] = rows;

    body = (
      <div className="extra-info__table-wrap">
        <table className="extra-info__table">
          <thead>
            <tr>
              {pad(head).map((cell, index) => (
                <th key={index} scope="col">
                  <LearningText as="span" text={cell} />
                </th>
              ))}
            </tr>
          </thead>
          {rest.length > 0 && (
            <tbody>
              {rest.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {pad(row).map((cell, index) => (
                    <td key={index}>
                      <LearningText as="span" text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    );
  } else {
    const List = style === "numbered" ? "ol" : "ul";

    body = (
      <List className={`extra-info__list extra-info__list--${style}`}>
        {lines.map((line, index) => (
          <li key={index}>
            <LearningText as="span" text={line} />
          </li>
        ))}
      </List>
    );
  }

  return (
    <section className={`extra-info ${className}`.trim()}>
      {heading && <LearningText as="h3" text={heading} className="extra-info__title" />}
      {body}
    </section>
  );
}

export default ExtraInfo;
