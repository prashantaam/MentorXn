/*
 * The pretend terminals a Practice Terminal block can be:
 *
 *   git    - version control (Code Quest's git lesson)
 *   linux  - a small file system and shell commands
 *   custom - the teacher's own "command -> output" pairs
 *
 * Each one: create(data) -> state, run(state, input) ->
 * { state, lines, clear?, ok }, prompt(state) -> text before "$".
 */
import { createGitState, runGit } from "./git";
import { createLinuxState, linuxPrompt, runLinux } from "./linux";
import { createCustomState, customPrompt, runCustom } from "./custom";

const splitFiles = (text) =>
  String(text ?? "app.py")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

export const TERMINALS = {
  git: {
    create: (data) => createGitState(splitFiles(data?.files)),
    run: (state, input) => {
      const result = runGit(state, input);
      return { ...result, ok: !result.lines.some((output) => output.kind === "bad") };
    },
    prompt: () => "",
  },
  linux: {
    create: createLinuxState,
    run: runLinux,
    prompt: linuxPrompt,
  },
  custom: {
    create: createCustomState,
    run: runCustom,
    prompt: customPrompt,
  },
};

/* Blocks saved before terminal types existed are git terminals. */
export const terminalKind = (data) => (TERMINALS[data?.kind] ? data.kind : "git");
