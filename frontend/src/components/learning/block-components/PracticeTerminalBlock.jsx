import { useEffect, useRef, useState } from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";
import { TERMINALS, terminalKind } from "../../../lib/practiceTerminal";
import { splitArgs } from "../../../lib/practiceTerminal/shared";
import { homeTree } from "../../../lib/practiceTerminal/linux";

/*
 * Practice Terminal: a pretend terminal for practising commands.
 * Nothing runs for real — lib/practiceTerminal simulates it.
 *
 * data.kind        = "git" | "linux" | "custom"  (old blocks: git)
 * data.welcome     = first line in the terminal
 * data.suggestions = suggested commands, one per line (chips)
 * data.suggestions_mode = "show" | "button" (behind 💡 Show commands) | "hide"
 * data.show_panel  = git: commit history · linux: folder tree
 * data.tasks       = [{ instruction, command }] — command holds the
 *                    accepted answers, one per line; a task is done
 *                    when one of them runs without an error
 * data.task_command_mode = "show" | "button" (💡 Show command) | "hide"
 * data.tasks_in_order    = only the next task can be completed
 * data.complete_message  = shown when every task is done
 *
 * git:    data.files (pretend project files)
 * linux:  data.username, data.start_files
 * custom: data.responses [{ command, output, kind }],
 *         data.prompt_text, data.unknown_message
 */
const isOn = (value, fallback) =>
  value === undefined || value === null || value === ""
    ? fallback
    : value === true || value === 1 || value === "1" || value === "true";

const DEFAULTS = {
  git: {
    welcome: "Welcome! Tap a command below in order, or type your own git command. Start with git init 👇",
    suggestions: [
      "git init",
      "git add .",
      'git commit -m "first version"',
      "git status",
      "git branch feature",
      "git checkout feature",
      "git add .",
      'git commit -m "try an idea"',
      "git checkout main",
      "git merge feature",
    ],
    panel: "📜 Commit history",
  },
  linux: {
    welcome: "Welcome to your practice shell! Type a command, or tap one below. Try pwd and ls first 👇",
    suggestions: ["pwd", "ls", "cd projects", "cat app.py", "cd ..", "mkdir notes", 'echo "Learn Linux" > notes/todo.txt', "cat notes/todo.txt", "tree"],
    panel: "📁 Your files",
  },
  custom: {
    welcome: "Type a command below, or tap one to try it 👇",
    suggestions: [],
    panel: "",
  },
};

const MAX_LINES = 200;

const splitLines = (text) =>
  String(text ?? "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

/* Compare commands ignoring extra spaces and " vs ' quotes. */
const matchKey = (text) => splitArgs(text).join("\u0001");

/* A task command as a matcher; * matches anything ("git commit -m *"). */
const toMatcher = (command) =>
  new RegExp(
    `^${matchKey(command)
      .split("*")
      .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join(".+?")}$`
  );

/* [{ instruction, command }] -> [{ instruction, commands, matchers }] */
function parseTasks(raw) {
  // Older blocks stored tasks as plain command lines.
  const list = Array.isArray(raw)
    ? raw
    : splitLines(raw).map((command) => ({ instruction: command, command }));

  return list
    .map((task) => {
      const commands = splitLines(task?.command);
      return {
        instruction: String(task?.instruction ?? "").trim() || commands[0] || "",
        commands,
        matchers: commands.map(toMatcher),
      };
    })
    .filter((task) => task.commands.length > 0);
}

const MODES = ["show", "button", "hide"];
const modeOf = (value, fallback) => (MODES.includes(value) ? value : fallback);

function TerminalLine({ line }) {
  if (line.kind === "cmd") {
    return (
      <div>
        {line.prompt && <span className="practice-terminal-block__prompt">{line.prompt}</span>}
        <span className="pr">$</span> {line.parts.join("")}
      </div>
    );
  }

  return (
    <div className={line.kind}>
      {line.parts.map((part, index) =>
        typeof part === "string" ? <span key={index}>{part}</span> : <b key={index}>{part.b}</b>
      )}
    </div>
  );
}

/* Linux side panel: the home folder as a tree. */
function FolderTree({ items }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.name}>
          <span className={item.isCurrent ? "is-current" : undefined}>
            {item.isDir ? "📁" : "📄"} {item.name}
            {item.isCurrent && " ← you are here"}
          </span>
          {item.children.length > 0 && <FolderTree items={item.children} />}
        </li>
      ))}
    </ul>
  );
}

function PracticeTerminalBlock({ block }) {
  const data = block?.data || {};
  const kind = terminalKind(data);
  const terminal = TERMINALS[kind];
  const defaults = DEFAULTS[kind];

  const welcome = String(data.welcome ?? "").trim() || defaults.welcome;
  const suggestions = splitLines(data.suggestions).length ? splitLines(data.suggestions) : defaults.suggestions;
  const suggestionsMode = modeOf(data.suggestions_mode, "show");
  const tasks = parseTasks(data.tasks);
  const taskCommandMode = modeOf(data.task_command_mode, "button");
  const tasksInOrder = isOn(data.tasks_in_order, false);
  const showPanel = isOn(data.show_panel ?? data.show_history, true) && kind !== "custom";

  // Anything that changes the starting state restarts the terminal.
  const signature = JSON.stringify([kind, welcome, data.files, data.username, data.start_files, data.responses, data.prompt_text, data.unknown_message, tasks, tasksInOrder]);

  const fresh = () => ({
    signature,
    sim: terminal.create(data),
    lines: [{ id: 0, kind: "dim", parts: [welcome] }],
    nextId: 1,
    history: [],
    done: [], // indexes of completed tasks
  });

  const [state, setState] = useState(fresh);
  const [input, setInput] = useState("");
  const [historyIndex, setHistoryIndex] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [revealed, setRevealed] = useState({}); // task index -> command shown

  const screenRef = useRef(null);
  const inputRef = useRef(null);

  // The setup changed (e.g. in the block editor): start again.
  const isStale = state.signature !== signature;
  if (isStale) {
    setState(fresh());
  }
  const view = isStale ? fresh() : state;

  // Keep the newest output in view.
  useEffect(() => {
    const screen = screenRef.current;
    if (screen) screen.scrollTop = screen.scrollHeight;
  }, [view.lines.length]);

  const run = (command) => {
    const text = String(command ?? "").trim();
    if (!text) return;

    setState((current) => {
      const prompt = terminal.prompt(current.sim);
      const result = terminal.run(current.sim, text);

      let nextId = current.nextId;
      const added = result.lines.map((output) => ({
        ...output,
        id: nextId++,
        ...(output.kind === "cmd" ? { prompt } : {}),
      }));

      // A task is done when one of its commands runs without an error.
      let done = current.done;
      if (result.ok) {
        const key = matchKey(text);
        const nextTask = tasks.findIndex((_, index) => !current.done.includes(index));
        const matched = tasks.findIndex(
          (task, index) =>
            !current.done.includes(index) &&
            (!tasksInOrder || index === nextTask) &&
            task.matchers.some((matcher) => matcher.test(key))
        );
        if (matched !== -1) done = [...current.done, matched];
      }

      return {
        ...current,
        sim: result.state,
        lines: result.clear ? [] : [...current.lines, ...added].slice(-MAX_LINES),
        nextId,
        history: [...current.history, text].slice(-50),
        done,
      };
    });
    setHistoryIndex(null);
  };

  const submit = (event) => {
    event.preventDefault();
    run(input);
    setInput("");
    inputRef.current?.focus();
  };

  // ↑ / ↓ bring back earlier commands, like a real terminal.
  const handleKeyDown = (event) => {
    if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
    const history = view.history;
    if (history.length === 0) return;
    event.preventDefault();

    const index =
      event.key === "ArrowUp"
        ? historyIndex === null
          ? history.length - 1
          : Math.max(0, historyIndex - 1)
        : historyIndex === null || historyIndex + 1 >= history.length
          ? null
          : historyIndex + 1;

    setHistoryIndex(index);
    setInput(index === null ? "" : history[index]);
  };

  const prompt = terminal.prompt(view.sim);
  const inputId = `${block?.id ?? "term"}-input`;
  const allDone = tasks.length > 0 && tasks.every((_, index) => view.done.includes(index));
  const nextTask = tasks.findIndex((_, index) => !view.done.includes(index));

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="practice-terminal-block"
    >
      <div ref={screenRef} className="term" role="log" aria-live="polite" aria-label="Terminal output">
        {view.lines.map((output) => (
          <TerminalLine key={output.id} line={output} />
        ))}
      </div>

      <form className="termin" onSubmit={submit}>
        <label className="practice-terminal-block__sr" htmlFor={inputId}>
          Type a command
        </label>
        {prompt && (
          <span className="practice-terminal-block__input-prompt" aria-hidden="true">
            {prompt}$
          </span>
        )}
        <input
          id={inputId}
          ref={inputRef}
          type="text"
          value={input}
          placeholder={kind === "git" ? "type a git command…" : "type a command…"}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="block-button block-button--primary practice-terminal-block__run">
          Run
        </button>
      </form>

      {/* ---------- suggested commands: shown, behind a button, or hidden ---------- */}
      {suggestions.length > 0 && suggestionsMode !== "hide" && (
        <div className="practice-terminal-block__spells">
          {suggestionsMode === "button" && (
            <button
              type="button"
              className="practice-terminal-block__toggle"
              aria-expanded={showSuggestions}
              onClick={() => setShowSuggestions((open) => !open)}
            >
              💡 {showSuggestions ? "Hide commands" : "Show commands"}
            </button>
          )}

          {(suggestionsMode === "show" || showSuggestions) && (
            <div className="chips" role="group" aria-label="Suggested commands">
              {suggestions.map((command, index) => (
                <button key={index} type="button" className="chip" onClick={() => run(command)}>
                  {command}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------- tasks: instructions, done when the right command runs ---------- */}
      {tasks.length > 0 && (
        <section className="practice-terminal-block__tasks" aria-label="Your tasks">
          <h3>
            🎯 Your tasks{" "}
            <span className="hint">
              {view.done.length} / {tasks.length} done
            </span>
          </h3>
          <ol>
            {tasks.map((task, index) => {
              const isDone = view.done.includes(index);
              const isNext = !isDone && (!tasksInOrder || index === nextTask);
              const showCommand =
                taskCommandMode === "show" || (taskCommandMode === "button" && revealed[index]);

              return (
                <li
                  key={index}
                  className={`practice-terminal-block__task${isDone ? " is-done" : ""}${!isDone && !isNext ? " is-waiting" : ""}`}
                >
                  <span className="practice-terminal-block__check" aria-hidden="true">
                    {isDone ? "✅" : "⬜"}
                  </span>
                  <div className="practice-terminal-block__task-body">
                    <LearningText as="span" text={task.instruction} />
                    <span className="practice-terminal-block__sr">{isDone ? " (done)" : " (not done yet)"}</span>

                    {showCommand && (
                      <span className="practice-terminal-block__task-command">
                        {task.commands.map((command, commandIndex) => (
                          <code key={commandIndex}>{command}</code>
                        ))}
                      </span>
                    )}

                    {taskCommandMode === "button" && !isDone && (
                      <button
                        type="button"
                        className="practice-terminal-block__toggle is-small"
                        aria-expanded={Boolean(revealed[index])}
                        onClick={() => setRevealed((current) => ({ ...current, [index]: !current[index] }))}
                      >
                        💡 {revealed[index] ? "Hide command" : "Show command"}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
          {allDone && (
            <div className="fb good" aria-live="polite">
              <LearningText as="span" text={data.complete_message || "🎉 All tasks done — nice work!"} />
            </div>
          )}
        </section>
      )}

      {/* ---------- side panel: git history / linux folder tree ---------- */}
      {showPanel && kind === "git" && (
        <section className="practice-terminal-block__panel" aria-label="Commit history">
          <h3>{defaults.panel}</h3>
          {!view.sim.init ? (
            <p className="hint">(no commits yet)</p>
          ) : (
            <div className="practice-terminal-block__branches">
              {Object.entries(view.sim.branches).map(([branch, commits]) => (
                <div key={branch} className={`mini${branch === view.sim.branch ? " is-current" : ""}`}>
                  <b>
                    {branch === "main" ? "🌳" : "🌿"} {branch}
                    {branch === view.sim.branch && " (current)"}
                  </b>
                  {commits.length > 0 ? (
                    <div className="practice-terminal-block__commits">
                      {commits.map((message, index) => (
                        <span key={index} className="tag good">
                          #{index + 1} “{message}”
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="hint">(no commits)</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {showPanel && kind === "linux" && (
        <section className="practice-terminal-block__panel" aria-label="Your files">
          <h3>{defaults.panel}</h3>
          {(() => {
            const tree = homeTree(view.sim);
            return (
              <div className="mini practice-terminal-block__tree">
                <span className={tree.isCurrent ? "is-current" : undefined}>
                  🏠 ~ (home){tree.isCurrent && " ← you are here"}
                </span>
                {tree.items.length > 0 ? <FolderTree items={tree.items} /> : <p className="hint">(empty)</p>}
              </div>
            );
          })()}
        </section>
      )}
    </LearningBlockShell>
  );
}

export default PracticeTerminalBlock;
