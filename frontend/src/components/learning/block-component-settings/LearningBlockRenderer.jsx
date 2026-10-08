import "../../../styles/blocks/index.js";

import {
  getBlockComponent,
} from "./blockRegistry";

import {
  LearningBlockSharedProvider,
} from "./LearningBlockShell";


/*
 * =========================================================
 * MentorXn - Learning Block Renderer
 * =========================================================
 *
 * Resolves the React component registered against a
 * learning block template.
 *
 * It also supplies shared block-level data to
 * LearningBlockShell.
 *
 * =========================================================
 */


function LearningBlockRenderer({
  block,
}) {
  if (!block) {
    return null;
  }


  /*
   * =========================================
   * Resolve Block Component
   * =========================================
   */

  const componentName =
    block
      ?.block_template
      ?.component;


  if (!componentName) {
    return (
      <div className="learning-block-unsupported">
        This learning block does not have a
        registered template component.
      </div>
    );
  }


  const BlockComponent =
    getBlockComponent(
      componentName
    );


  if (!BlockComponent) {
    return (
      <div className="learning-block-unsupported">
        Unsupported learning block
        component:{" "}

        <strong>
          {componentName}
        </strong>
      </div>
    );
  }


  /*
   * =========================================
   * Shared Block Data
   * =========================================
   *
   * Shared functionality belongs here rather
   * than inside individual block components.
   *
   * Every learning block can therefore use:
   *
   * block.data.messages
   *
   * without MCQQuizBlock, SequenceBlock,
   * etc. containing
   * message-specific code.
   *
   * =========================================
   */

  const messages =
    Array.isArray(
      block
        ?.data
        ?.messages
    )
      ? block.data.messages
      : [];


  /*
   * =========================================
   * Render
   * =========================================
   *
   * LearningBlockSharedProvider passes shared
   * information down to LearningBlockShell.
   *
   * The actual BlockComponent remains unaware
   * of Messages.
   */

  return (
    <div className="learning-block-renderer">
      <LearningBlockSharedProvider
        messages={
          messages
        }
      >
        <BlockComponent
          block={
            block
          }
        />
      </LearningBlockSharedProvider>
    </div>
  );
}


export default LearningBlockRenderer;