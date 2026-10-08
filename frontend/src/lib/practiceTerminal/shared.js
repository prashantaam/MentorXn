/*
 * Shared helpers for the pretend terminals (git, linux, custom).
 *
 * Every simulator exposes:
 *   create(data)        -> starting state
 *   run(state, input)   -> { state, lines, clear?, ok }
 *   prompt(state)       -> the text before "$"
 *
 * Output lines are { kind, parts }:
 *   kind:  "cmd" (echoed command) | "ok" | "bad" | "dim" | "dir" | "" (plain)
 *   parts: plain strings or { b: "bold text" }
 * Everything is rendered as text by React, never as HTML.
 */

export const line = (kind, ...parts) => ({ kind, parts });

/* Squash spaces so "git   add ." matches "git add .". */
export const normalizeCommand = (text) => String(text ?? "").trim().replace(/\s+/g, " ");

/*
 * Split a command line like a shell would, keeping quoted text
 * together:  echo "hello world" > notes.txt
 *   -> ["echo", "hello world", ">", "notes.txt"]
 */
export function splitArgs(text) {
  const args = [];
  let current = "";
  let quote = null;
  let hasToken = false;

  for (const char of String(text ?? "")) {
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      hasToken = true;
      continue;
    }
    if (/\s/.test(char)) {
      if (hasToken) args.push(current);
      current = "";
      hasToken = false;
      continue;
    }
    if (char === ">") {
      if (hasToken) args.push(current);
      // ">>" stays together
      if (args[args.length - 1] === ">" && !hasToken) args[args.length - 1] = ">>";
      else args.push(">");
      current = "";
      hasToken = false;
      continue;
    }
    current += char;
    hasToken = true;
  }

  if (hasToken) args.push(current);
  return args;
}
