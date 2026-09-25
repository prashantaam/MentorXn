import BigIdeasBlock from "../block-components/BigIdeasBlock";
import FlipCardBlock from "../block-components/FlipCardBlock";
import CodeExampleBlock from "../block-components/CodeExampleBlock";
import SequenceBlock from "../block-components/SequenceBlock";
import QuizBlock from "../block-components/QuizBlock";

const blockRegistry = {
  /*
   * Big Ideas
   *
   * BigIdeasBlock is the current component name.
   * ChipSelectorBlock is retained temporarily as a legacy alias
   * so existing learning blocks continue to render.
   */
  BigIdeasBlock: {
    component: BigIdeasBlock,
  },

  ChipSelectorBlock: {
    component: BigIdeasBlock,
  },

  FlipCardBlock: {
    component: FlipCardBlock,
  },

  CodeExampleBlock: {
    component: CodeExampleBlock,
  },
  SequenceBlock: {
    component: SequenceBlock,
  },
  QuizBlock: {
  component: QuizBlock,
},
};

export const getBlockComponent = (componentName) => {
  return blockRegistry[componentName]?.component || null;
};

export const isRegisteredBlockComponent = (componentName) => {
  return Boolean(blockRegistry[componentName]);
};

export default blockRegistry;