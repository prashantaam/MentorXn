import ContentBlock from "./ContentBlock";
import QuizBlock from "./QuizBlock";
import PracticeTerminalBlock from "./PracticeTerminalBlock";

function LearningBlockRenderer({
  block,
}) {
  if (!block) {
    return null;
  }

  switch (block.type) {
    case "content":
      return (
        <ContentBlock
          block={block}
        />
      );

    case "quiz":
      return (
        <QuizBlock
          block={block}
        />
      );

    case "practice_terminal":
      return (
        <PracticeTerminalBlock
          block={block}
        />
      );

    default:
      return (
        <div className="learning-block-unsupported">
          Unsupported learning
          block:{" "}
          <strong>
            {block.type}
          </strong>
        </div>
      );
  }
}

export default LearningBlockRenderer;