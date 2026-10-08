/*
 * =========================================================
 * Practice Terminal - a tiny pretend Git
 * =========================================================
 *
 * Simulates the Git commands a beginner learns, the same way
 * Code Quest's "Version control" lesson does. Nothing is run
 * for real: runGit(state, input) returns the new state plus
 * the lines to print.
 *
 * Output lines are { parts, kind } where parts is a list of
 * plain strings or { b: "bold text" } — rendered by React, so
 * nothing a student types is ever treated as HTML.
 * =========================================================
 */

/* A fresh repository-less folder. */
export function createGitState(files) {
  return {
    init: false,
    staged: [],
    branch: "main",
    branches: { main: [] },
    files: files.length > 0 ? files : ["app.py"],
  };
}

const line = (kind, ...parts) => ({ kind, parts });

const HELP = [
  "git init",
  "git add .",
  'git commit -m "message"',
  "git status",
  "git log",
  "git branch [name]",
  "git checkout <name>",
  "git checkout -b <name>",
  "git switch <name>",
  "git merge <name>",
  "clear",
];

const VALID_BRANCH = /^[A-Za-z0-9._/-]+$/;

/*
 * Run one command. Returns { state, lines, clear }.
 * clear: true means the screen should be wiped.
 */
export function runGit(state, input) {
  const command = String(input ?? "").trim().replace(/\s+/g, " ");
  if (!command) return { state, lines: [] };

  const echo = line("cmd", command);

  if (command === "clear") return { state, lines: [], clear: true };

  if (command === "help" || command === "git help" || command === "git --help") {
    return { state, lines: [echo, line("dim", "Try: ", ...HELP.flatMap((cmd, i) => (i ? [" · ", { b: cmd }] : [{ b: cmd }])))] };
  }

  if (!command.startsWith("git")) {
    return { state, lines: [echo, line("bad", "Try a command starting with ", { b: "git" }, " 😉")] };
  }

  const words = command.split(" ");
  const sub = words[1];
  const needRepo = () => ({
    state,
    lines: [echo, line("bad", "Not a git repository yet. Run ", { b: "git init" }, " first.")],
  });

  /* ---------- git init ---------- */
  if (sub === "init") {
    if (state.init) {
      return { state, lines: [echo, line("dim", "Reinitialized existing Git repository. (It was already set up!)")] };
    }
    return {
      state: { ...state, init: true, branches: { main: [] }, branch: "main", staged: [] },
      lines: [echo, line("ok", "Initialized empty Git repository. 🎉")],
    };
  }

  if (!state.init) return needRepo();

  /* ---------- git add ---------- */
  if (sub === "add") {
    const target = words[2];
    if (!target) {
      return { state, lines: [echo, line("bad", "Nothing specified. Try ", { b: "git add ." }, " to stage every file.")] };
    }
    const files = target === "." || target === "-A" || target === "--all" ? state.files : state.files.filter((file) => file === target);
    if (files.length === 0) {
      return { state, lines: [echo, line("bad", `fatal: pathspec '${target}' did not match any files. Files here: ${state.files.join(", ")}`)] };
    }
    const staged = [...new Set([...state.staged, ...files])];
    return { state: { ...state, staged }, lines: [echo, line("ok", "Changes staged: ", files.join(", "))] };
  }

  /* ---------- git commit ---------- */
  if (sub === "commit") {
    if (state.staged.length === 0) {
      return { state, lines: [echo, line("bad", "Nothing staged. Run ", { b: "git add ." }, " first.")] };
    }
    const match = command.match(/-m\s+(?:"([^"]*)"|'([^']*)'|(\S+))/);
    const message = (match && (match[1] ?? match[2] ?? match[3]))?.trim() || "update";
    const branches = { ...state.branches, [state.branch]: [...state.branches[state.branch], message] };
    return {
      state: { ...state, branches, staged: [] },
      lines: [echo, line("ok", `[${state.branch}] ${message}`), line("ok", `${state.staged.length} file${state.staged.length === 1 ? "" : "s"} changed 📸`)],
    };
  }

  /* ---------- git status ---------- */
  if (sub === "status") {
    return {
      state,
      lines: [
        echo,
        line("dim", `On branch ${state.branch}`),
        line("dim", state.staged.length ? `Changes staged and ready to commit: ${state.staged.join(", ")}` : "Nothing staged. Working tree clean."),
      ],
    };
  }

  /* ---------- git log ---------- */
  if (sub === "log") {
    const commits = state.branches[state.branch];
    if (commits.length === 0) {
      return { state, lines: [echo, line("dim", `No commits yet on ${state.branch}.`)] };
    }
    const oneline = words.includes("--oneline");
    const newestFirst = commits.map((message, index) => ({ message, number: index + 1 })).reverse();
    return {
      state,
      lines: [
        echo,
        ...newestFirst.map(({ message, number }) =>
          line("dim", oneline ? `#${number} ${message}` : `commit #${number} — "${message}"`)
        ),
      ],
    };
  }

  /* ---------- git branch ---------- */
  if (sub === "branch") {
    const name = words[2];
    if (!name) {
      return {
        state,
        lines: [echo, ...Object.keys(state.branches).map((branch) => line(branch === state.branch ? "ok" : "dim", `${branch === state.branch ? "* " : "  "}${branch}`))],
      };
    }
    if (!VALID_BRANCH.test(name)) {
      return { state, lines: [echo, line("bad", `fatal: '${name}' is not a valid branch name.`)] };
    }
    if (state.branches[name]) {
      return { state, lines: [echo, line("bad", `fatal: a branch named '${name}' already exists.`)] };
    }
    return {
      state: { ...state, branches: { ...state.branches, [name]: [...state.branches[state.branch]] } },
      lines: [echo, line("ok", `Created branch "${name}" 🌿`)],
    };
  }

  /* ---------- git checkout / git switch ---------- */
  if (sub === "checkout" || sub === "switch") {
    const create = words[2] === "-b" || words[2] === "-c";
    const name = create ? words[3] : words[2];
    if (!name) {
      return { state, lines: [echo, line("bad", `Which branch? Try `, { b: `git ${sub} main` })] };
    }

    let branches = state.branches;
    if (create) {
      if (!VALID_BRANCH.test(name)) return { state, lines: [echo, line("bad", `fatal: '${name}' is not a valid branch name.`)] };
      if (branches[name]) return { state, lines: [echo, line("bad", `fatal: a branch named '${name}' already exists.`)] };
      branches = { ...branches, [name]: [...branches[state.branch]] };
    }

    if (!branches[name]) {
      return {
        state,
        lines: [echo, line("bad", `error: branch "${name}" does not exist. Try: `, { b: `git branch ${name}` })],
      };
    }
    if (name === state.branch && !create) {
      return { state, lines: [echo, line("dim", `Already on '${name}'`)] };
    }

    return {
      state: { ...state, branches, branch: name },
      lines: [echo, line("ok", `Switched to ${create ? "a new " : ""}branch "${name}"`)],
    };
  }

  /* ---------- git merge ---------- */
  if (sub === "merge") {
    const name = words[2];
    if (!name || !state.branches[name]) {
      return { state, lines: [echo, line("bad", `error: branch "${name || ""}" does not exist.`)] };
    }
    if (name === state.branch) {
      return { state, lines: [echo, line("dim", "Already up to date. (You can't merge a branch into itself.)")] };
    }
    const current = state.branches[state.branch];
    const incoming = state.branches[name].filter((message) => !current.includes(message));
    if (incoming.length === 0) {
      return { state, lines: [echo, line("dim", "Already up to date.")] };
    }
    return {
      state: { ...state, branches: { ...state.branches, [state.branch]: [...current, ...incoming] } },
      lines: [echo, line("ok", `Merged ${incoming.length} commit${incoming.length === 1 ? "" : "s"} from "${name}" into "${state.branch}" ✅`)],
    };
  }

  return {
    state,
    lines: [echo, line("bad", "Unknown command. Try: ", HELP.join(" · "))],
  };
}
