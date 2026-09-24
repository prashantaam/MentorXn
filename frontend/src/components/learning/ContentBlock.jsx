import LearningBlockShell from "./LearningBlockShell";

function ContentBlock({
  block,
}) {
  if (!block) {
    return null;
  }

  const data =
    block.data || {};

  /*
   * Legacy Content block
   */
  const legacyContent =
    data.content || "";

  /*
   * Template-driven Content block
   */
  const text =
    data.text || "";

  const code =
    data.code || "";

  const language =
    data.language || "";

  const hasTemplateContent =
    Boolean(
      text ||
      code
    );

  return (
    <LearningBlockShell
      title={block.title}
      icon={block.icon}
    >
      {hasTemplateContent ? (
        <>
          {text && (
            <div className="learning-content-text">
              {text}
            </div>
          )}

          {code && (
            <div className="learning-content-code-wrapper">
              {language && (
                <div className="learning-content-code-language">
                  {language}
                </div>
              )}

              <pre className="learning-content-code">
                <code>
                  {code}
                </code>
              </pre>
            </div>
          )}
        </>
      ) : (
        <div className="learning-content-text">
          {legacyContent}
        </div>
      )}
    </LearningBlockShell>
  );
}

export default ContentBlock;