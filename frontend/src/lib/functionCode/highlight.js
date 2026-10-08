/*
 * Tiny syntax highlighter for FunctionCode's code panel.
 *
 * Splits a line into [text, className] tokens using the
 * .code .c / .k / .s / .n / .t colours from adventure-land.css.
 * Output is plain text pieces, rendered by React (no innerHTML).
 */

const KEYWORDS = {
  python:
    "def return if elif else for while in range True False None and or not class import from as try except finally break continue pass lambda print len is global with del raise assert type str int float list",
  javascript:
    "function return if else for while of in let const var true false null undefined new class import from export try catch finally break continue typeof instanceof this console log",
};

function buildPattern(language) {
  const comment = language === "python" ? "#.*$" : "\\/\\/.*$";
  const keywords = KEYWORDS[language].split(" ").join("|");
  return new RegExp(
    `(${comment})|("(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)|\\b(${keywords})\\b|\\b([A-Z][A-Za-z0-9_]*)\\b|(\\b\\d+(?:\\.\\d+)?\\b)`,
    "gm"
  );
}

const PATTERNS = {
  python: buildPattern("python"),
  javascript: buildPattern("javascript"),
};

/* "x = 5  # hi" -> [["x = "], ["5", "n"], ["  "], ["# hi", "c"]] */
export function highlightLine(line, language) {
  const pattern = PATTERNS[language] || PATTERNS.python;
  const tokens = [];
  let lastIndex = 0;

  pattern.lastIndex = 0;
  for (const match of line.matchAll(pattern)) {
    if (match.index > lastIndex) tokens.push([line.slice(lastIndex, match.index)]);
    const [text, comment, string, keyword, type] = match;
    tokens.push([text, comment ? "c" : string ? "s" : keyword ? "k" : type ? "t" : "n"]);
    lastIndex = match.index + text.length;
  }

  if (lastIndex < line.length) tokens.push([line.slice(lastIndex)]);
  return tokens;
}
