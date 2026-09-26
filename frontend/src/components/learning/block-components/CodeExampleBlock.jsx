import {
  useEffect,
  useMemo,
  useState,
} from "react";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";


function CodeExampleBlock({
  block,
}) {
  const data =
    block?.data || {};

  const examples =
    Array.isArray(data.examples)
      ? data.examples.filter(
          (example) =>
            example &&
            (
              example.code ||
              example.label ||
              example.language
            )
        )
      : [];

  const hasMultipleExamples =
    examples.length > 0;

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(0);

  const [
    showOutput,
    setShowOutput,
  ] = useState(false);

  /*
   * =========================================================
   * Reset interactive state when block changes
   * =========================================================
   */
  useEffect(() => {
    setSelectedIndex(0);
    setShowOutput(false);
  }, [
    block?.id,
    examples.length,
  ]);

  /*
   * =========================================================
   * Current example
   * =========================================================
   *
   * New mode:
   * data.examples[]
   *
   * Existing mode:
   * data.code
   * data.language
   * data.explanation
   *
   * This keeps old CodeExampleBlock records working.
   * =========================================================
   */
  const currentExample =
    useMemo(() => {
      if (
        hasMultipleExamples
      ) {
        return (
          examples[
            selectedIndex
          ] ||
          examples[0]
        );
      }

      return {
        label:
          data.language ||
          "Code",

        language:
          data.language ||
          "text",

        code:
          data.code ||
          "",

        command:
          data.command ||
          "",

        output:
          data.output ||
          "",

        explanation:
          data.explanation ||
          "",
      };
    }, [
      data,
      examples,
      hasMultipleExamples,
      selectedIndex,
    ]);

  const code =
    String(
      currentExample?.code ||
      ""
    );

  const language =
    currentExample?.language ||
    "text";

  const languageLabel =
    currentExample?.label ||
    language;

  const description =
    data.description ||
    "";

  const explanation =
    currentExample?.explanation ||
    data.explanation ||
    "";

  const command =
    String(
      currentExample?.command ||
      ""
    );

  const output =
    String(
      currentExample?.output ||
      ""
    );

  const hasRunnableOutput =
    Boolean(
      command ||
      output
    );

  const runButtonLabel =
    data.run_button_label ||
    "▶ Run it";

  const outputPlaceholder =
    data.output_placeholder ||
    "Press run!";

  /*
   * =========================================================
   * Select example
   * =========================================================
   */
  const handleSelectExample =
    (index) => {
      setSelectedIndex(index);

      /*
       * Match Code Quest behaviour:
       * changing language resets the output.
       */
      setShowOutput(false);
    };

  /*
   * =========================================================
   * Run
   * =========================================================
   *
   * This intentionally simulates the output.
   * It does NOT execute arbitrary learner/teacher code.
   * =========================================================
   */
  const handleRun = () => {
    setShowOutput(true);
  };

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={
        data.subtitle
      }
      className="code-example-block"
    >
      {/* ===================================================
          Description
          =================================================== */}

      {description && (
        <LearningText
          text={
            description
          }
          className="code-example-description"
        />
      )}

      {/* ===================================================
          Example / Language Tabs
          =================================================== */}

      {hasMultipleExamples && (
        <div
          className="code-example-tabs"
          role="tablist"
          aria-label="Code examples"
        >
          {examples.map(
            (
              example,
              index
            ) => {
              const isSelected =
                index ===
                selectedIndex;

              const label =
                example?.label ||
                example?.language ||
                `Example ${index + 1}`;

              return (
                <button
                  key={`code-example-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={
                    isSelected
                  }
                  className={
                    `code-example-tab${
                      isSelected
                        ? " is-active"
                        : ""
                    }`
                  }
                  onClick={() =>
                    handleSelectExample(
                      index
                    )
                  }
                >
                  {label}
                </button>
              );
            }
          )}
        </div>
      )}

      {/* ===================================================
          Code Example
          =================================================== */}

      {code ? (
        <>
          <div className="code-example-wrapper">
            {/* Toolbar */}

            <div className="code-example-toolbar">
              <span className="code-example-language">
                {languageLabel}
              </span>
            </div>

            {/* Syntax Highlighted Code */}

            <div className="code-example-syntax">
              <SyntaxHighlighter
                language={
                  language
                }
                style={
                  vscDarkPlus
                }
                showLineNumbers={
                  true
                }
                wrapLongLines={
                  false
                }
                customStyle={{
                  margin: 0,
                  padding:
                    "18px",
                  background:
                    "#1e1e1e",
                  borderRadius:
                    "0 0 14px 14px",
                  fontSize:
                    "14px",
                  lineHeight:
                    "1.65",
                }}
                codeTagProps={{
                  style: {
                    fontFamily:
                      'Consolas, Monaco, "Courier New", monospace',
                  },
                }}
              >
                {code}
              </SyntaxHighlighter>
            </div>
          </div>

          {/* =================================================
              Run Button + Terminal
              ================================================= */}

          {hasRunnableOutput && (
            <div className="code-example-run-section">
              <div className="code-example-run-actions">
                <button
                  type="button"
                  className="block-button block-button--primary"
                  onClick={
                    handleRun
                  }
                >
                  {runButtonLabel}
                </button>
              </div>

              <div
                className="code-example-terminal"
                aria-live="polite"
              >
                {!showOutput ? (
                  <span className="code-example-terminal-placeholder">
                    {
                      outputPlaceholder
                    }
                  </span>
                ) : (
                  <>
                    {command && (
                      <div className="code-example-terminal-command">
                        <span
                          className="code-example-terminal-prompt"
                          aria-hidden="true"
                        >
                          $
                        </span>

                        <span>
                          {command}
                        </span>
                      </div>
                    )}

                    {output && (
                      <pre className="code-example-terminal-output">
                        {output}
                      </pre>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="block-empty">
          No code example has been configured yet.
        </div>
      )}

      {/* ===================================================
          Explanation
          =================================================== */}

      {explanation && (
        <div className="code-example-explanation">
          <span
            className="code-example-explanation-icon"
            aria-hidden="true"
          >
            💡
          </span>

          <LearningText
            text={
              explanation
            }
            className="code-example-explanation-text"
          />
        </div>
      )}
    </LearningBlockShell>
  );
}

export default CodeExampleBlock;