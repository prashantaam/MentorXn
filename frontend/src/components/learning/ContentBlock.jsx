import LearningBlockShell from "./LearningBlockShell";

function ContentBlock({ block }) {
  if (!block) {
    return null;
  }

  const content =
    block.data?.content || "";

  return (
    <LearningBlockShell
      title={block.title}
      icon={block.icon}
    >
      <div className="learning-content-text">
        {content}
      </div>
    </LearningBlockShell>
  );
}

export default ContentBlock;