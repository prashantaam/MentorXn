import LearningBlockShell from "../block-component-settings/LearningBlockShell";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeExampleBlock({ block }) {
  const data = block?.data || {};

  const code = String(data.code || "");
  const language = data.language || "text";
  const description = data.description || "";
  const explanation = data.explanation || "";

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="code-example-block"
    >
      {description && (
        <p className="code-example-description">
          {description}
        </p>
      )}

      {code ? (
        <div className="code-example-wrapper">
          <div className="code-example-toolbar">
            <span className="code-example-language">
              {language}
            </span>
          </div>

          <div className="code-example-syntax">
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={true}
              wrapLongLines={false}
              customStyle={{
                margin: 0,
                padding: "18px",
                background: "#1e1e1e",
                borderRadius: "0 0 14px 14px",
                fontSize: "14px",
                lineHeight: "1.65",
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
      ) : (
        <div className="panel">
          No code example has been configured yet.
        </div>
      )}

      {explanation && (
        <div className="code-example-explanation">
          <span
            className="code-example-explanation-icon"
            aria-hidden="true"
          >
            💡
          </span>

          <p>{explanation}</p>
        </div>
      )}
    </LearningBlockShell>
  );
}

export default CodeExampleBlock;