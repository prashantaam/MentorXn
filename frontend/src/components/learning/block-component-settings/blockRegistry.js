import ChipSelectorBlock from "../block-components/ChipSelectorBlock";
import FlipCardsBlock from "../block-components/FlipCardsBlock";
import CodeExampleBlock from "../block-components/CodeExampleBlock";

const blockRegistry = {

  ChipSelectorBlock: {
    component: ChipSelectorBlock,
  },

  FlipCardsBlock: {
    component: FlipCardsBlock,
  },

  CodeExampleBlock: {
    component: CodeExampleBlock,
  },
};

export const getBlockComponent = (componentName) => {
  return blockRegistry[componentName]?.component || null;
};

export const isRegisteredBlockComponent = (componentName) => {
  return Boolean(blockRegistry[componentName]);
};

export default blockRegistry;