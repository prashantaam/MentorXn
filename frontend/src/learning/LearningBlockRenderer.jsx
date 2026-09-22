import LearningBlockShell from "./LearningBlockShell";

import ContentBlock from "./content/ContentBlock";
import QuizBlock from "./quiz/QuizBlock";

function LearningBlockRenderer({
  block,
}) {
  if (!block) {
    return null;
  }

  let content = null;

  switch (block.type) {
    case "content":
      content = (
        <ContentBlock
          content={block.content}
        />
      );

      break;

    case "quiz":
      content = (
        <QuizBlock
          instructions={
            block.instructions
          }
          questions={
            block.questions
          }
          passingScore={
            block.passingScore
          }
          allowRetry={
            block.allowRetry
          }
        />
      );

      break;

    default:
      content = (
        <div>
          Unknown learning block:
          {" "}
          {block.type}
        </div>
      );
  }

  return (
    <LearningBlockShell
      title={block.title}
      icon={block.icon}
      type={block.type}
    >
      {content}
    </LearningBlockShell>
  );
}

export default LearningBlockRenderer;