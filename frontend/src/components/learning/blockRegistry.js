import ContentBlock from "./ContentBlock";
import QuizBlock from "./QuizBlock";
import PracticeTerminalBlock from "./PracticeTerminalBlock";

import ChipSelectorBlock from "./BlockComponents/ChipSelectorBlock";
import FlipCardsBlock from "./BlockComponents/FlipCardsBlock";

const blockRegistry = {
  ContentBlock: {
    component: ContentBlock,
  },

  QuizBlock: {
    component: QuizBlock,
  },

  PracticeTerminalBlock: {
    component: PracticeTerminalBlock,
  },

  ChipSelectorBlock: {
    component: ChipSelectorBlock,
  },

  FlipCardsBlock: {
    component: FlipCardsBlock,
  },
};

export const getBlockComponent = (
  componentName
) => {
  return (
    blockRegistry[componentName]
      ?.component || null
  );
};

export const isRegisteredBlockComponent = (
  componentName
) => {
  return Boolean(
    blockRegistry[componentName]
  );
};

export default blockRegistry;