import { useState } from "react";

import LearningBlockShell from "./LearningBlockShell";

function PracticeTerminalBlock({ block }) {
  const data = block?.data || {};

  const commands = data.commands || [];

  const [input, setInput] = useState("");

  const [history, setHistory] = useState([]);

 
  if (!block) {
    return null;
  }

  const normaliseCommand = (
    value
  ) =>
    value
      .trim()
      .replace(/\s+/g, " ");

  const runCommand = (
    commandValue = input
  ) => {
    const enteredCommand =
      normaliseCommand(
        commandValue
      );

    if (!enteredCommand) {
      return;
    }

    const matchedCommand =
      commands.find(
        (item) =>
          normaliseCommand(
            item.command
          ) === enteredCommand
      );

    let output;

    let status;

    if (matchedCommand) {
      output =
        matchedCommand.output;

      status = "success";
    } else {
      const prefix =
        data.command_prefix?.trim();

      if (
        prefix &&
        !enteredCommand.startsWith(
          prefix
        )
      ) {
        output =
          `Command not recognised. Try a command starting with "${prefix}".`;
      } else {
        output =
          "That command is not available in this practice terminal yet.";
      }

      status = "error";
    }

    setHistory(
      (current) => [
        ...current,
        {
          command:
            enteredCommand,

          output,

          status,
        },
      ]
    );

    setInput("");
  };

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    runCommand();
  };

  const handleSuggestedCommand = (
    command
  ) => {
    runCommand(command);
  };

  return (
    <LearningBlockShell
      title={block.title}
      icon={
        block.icon || "🪄"
      }
    >
      <div className="learning-terminal">
        {(data.welcome ||
          data.tip) && (
          <div className="learning-terminal-intro">
            {data.welcome && (
              <p>
                {data.welcome}
              </p>
            )}

            {data.tip && (
              <div className="learning-terminal-tip">
                💡 {data.tip}
              </div>
            )}
          </div>
        )}

        <div className="learning-terminal-window">
          <div className="learning-terminal-bar">
            <div className="learning-terminal-dots">
              <span />
              <span />
              <span />
            </div>

            <span className="learning-terminal-title">
              MentorXn Practice
              Terminal
            </span>
          </div>

          <div className="learning-terminal-screen">
            {history.length ===
              0 && (
              <div className="learning-terminal-muted">
                Terminal ready.
              </div>
            )}

            {history.map(
              (
                entry,
                index
              ) => (
                <div
                  key={index}
                  className="learning-terminal-history"
                >
                  <div className="learning-terminal-command">
                    <span>
                      $
                    </span>

                    <span>
                      {
                        entry.command
                      }
                    </span>
                  </div>

                  <pre
                    className={`learning-terminal-output ${entry.status}`}
                  >
                    {
                      entry.output
                    }
                  </pre>
                </div>
              )
            )}

            <form
              className="learning-terminal-input-row"
              onSubmit={
                handleSubmit
              }
            >
              <span className="learning-terminal-prompt">
                $
              </span>

              <input
                type="text"
                value={input}
                autoComplete="off"
                spellCheck="false"
                aria-label="Terminal command"
                placeholder={
                  data.command_prefix
                    ? `${data.command_prefix} ...`
                    : "Type a command..."
                }
                onChange={(
                  event
                ) =>
                  setInput(
                    event.target
                      .value
                  )
                }
              />

              <button
                type="submit"
              >
                Run
              </button>
            </form>
          </div>
        </div>

        {commands.length >
          0 && (
          <div className="learning-terminal-suggestions">
            <span>
              Try:
            </span>

            <div className="learning-terminal-command-buttons">
              {commands.map(
                (
                  item,
                  index
                ) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      handleSuggestedCommand(
                        item.command
                      )
                    }
                  >
                    {
                      item.command
                    }
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </LearningBlockShell>
  );
}

export default PracticeTerminalBlock;