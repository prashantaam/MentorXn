import "../../styles/blocks/index.css";

import {
  getBlockComponent,
} from "./blockRegistry";


function LearningBlockRenderer({
  block,
}) {
  if (!block) {
    return null;
  }

  const componentName =
    block.lblock_template?.component;

  if (!componentName) {
    return (
      <div className="learning-block-unsupported">
        This learning block does not have a
        registered template component.
      </div>
    );
  }

  const BlockComponent =
    getBlockComponent(componentName);

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

  return (
    <BlockComponent
      block={block}
    />
  );
}

export default LearningBlockRenderer;