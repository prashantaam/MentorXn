/*
 * Custom pretend terminal: the teacher writes "command -> output"
 * pairs, so any tool can be practised (npm, python, docker, …).
 *
 *   responses = [{ command, output, kind }]
 *     command: exact text, or with * wildcards: "pip install *"
 *     output:  lines to print; {1}, {2}… are the wildcard parts,
 *              {command} is the whole command
 *     kind:    "ok" | "bad" | "dim" | "" (plain)
 */
import { line, normalizeCommand } from "./shared";

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* "pip install *" -> /^pip install (.+)$/ */
function toMatcher(pattern) {
  const source = normalizeCommand(pattern)
    .split("*")
    .map(escapeRegex)
    .join("(.+?)");
  return new RegExp(`^${source}$`);
}

export function createCustomState(data) {
  const responses = (Array.isArray(data?.responses) ? data.responses : [])
    .filter((response) => normalizeCommand(response?.command))
    .map((response) => ({
      matcher: toMatcher(response.command),
      output: String(response.output ?? ""),
      kind: ["ok", "bad", "dim", ""].includes(response.kind) ? response.kind : "",
    }));

  return {
    responses,
    promptText: String(data?.prompt_text ?? "").trim(),
    unknown: String(data?.unknown_message ?? "").trim() || "{command}: command not found",
  };
}

export function runCustom(state, input) {
  const command = normalizeCommand(input);
  if (!command) return { state, lines: [], ok: true };

  const echo = line("cmd", command);
  if (command === "clear") return { state, lines: [], clear: true, ok: true };

  for (const response of state.responses) {
    const match = command.match(response.matcher);
    if (!match) continue;

    const text = response.output
      .replace(/\{command\}/g, command)
      .replace(/\{(\d+)\}/g, (_, number) => match[Number(number)] ?? "");

    const lines = text === "" ? [] : text.split("\n").map((part) => line(response.kind, part));
    return { state, lines: [echo, ...lines], ok: response.kind !== "bad" };
  }

  return {
    state,
    lines: [echo, line("bad", state.unknown.replace(/\{command\}/g, command.split(" ")[0]))],
    ok: false,
  };
}

export const customPrompt = (state) => state.promptText;
