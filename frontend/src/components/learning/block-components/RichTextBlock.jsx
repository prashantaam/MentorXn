import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import RichTextContent from "../shared/RichTextContent";

/*
 * Rich text block: the common icon, title and messages (from
 * LearningBlockShell) around formatted text written by the teacher.
 *
 * data.content is a TipTap JSON document.
 */
function RichTextBlock({ block }) {
  const data = block?.data || {};

  return (
    <LearningBlockShell
      title={block?.title}
      icon={block?.icon}
      subtitle={data.subtitle}
      className="rich-text-block"
    >
      <RichTextContent
        doc={data.content}
        className="rich-text-block__body"
        emptyText="Write the content for this block in the settings panel."
      />
    </LearningBlockShell>
  );
}

export default RichTextBlock;
