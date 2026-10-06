import BigIdeasBlock from "../block-components/BigIdeasBlock";
import FlipCardBlock from "../block-components/FlipCardBlock";
import CodeExampleBlock from "../block-components/CodeExampleBlock";
import SequenceBlock from "../block-components/SequenceBlock";
import MCQQuizBlock from "../block-components/MCQQuizBlock";
import ProcessFlowBlock from "../block-components/ProcessFlowBlock";
import ToggleExplorerBlock from "../block-components/ToggleExplorerBlock";
import CodeActionBlock from "../block-components/CodeActionBlock";
import DragBucketBlock from "../block-components/DragBucketBlock";
import ArrangeTextBlock from "../block-components/ArrangeTextBlock";
import RichTextBlock from "../block-components/RichTextBlock";
import AccordionBlock from "../block-components/AccordionBlock";
import SentenceBuilderBlock from "../block-components/SentenceBuilderBlock";
import InlineGlossaryBlock from "../block-components/InlineGlossaryBlock";
import MatchingPairsBlock from "../block-components/MatchingPairsBlock";
import WorkedExampleBlock from "../block-components/WorkedExampleBlock";
import HierarchyBlock from "../block-components/HierarchyBlock";
import WordBankBlock from "../block-components/WordBankBlock";
import TrueFalseBlock from "../block-components/TrueFalseBlock";
import FillBlanksBlock from "../block-components/FillBlanksBlock";
import SpeedQuizBlock from "../block-components/SpeedQuizBlock";
import HintLadderBlock from "../block-components/HintLadderBlock";
import DecisionTreeBlock from "../block-components/DecisionTreeBlock";
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

  RichTextBlock: {
    component: RichTextBlock,
  },

  AccordionBlock: {
    component: AccordionBlock,
  },

  SentenceBuilderBlock: {
    component: SentenceBuilderBlock,
  },

  InlineGlossaryBlock: {
    component: InlineGlossaryBlock,
  },

  MatchingPairsBlock: {
    component: MatchingPairsBlock,
  },

  WorkedExampleBlock: {
    component: WorkedExampleBlock,
  },

  HierarchyBlock: {
    component: HierarchyBlock,
  },

  WordBankBlock: {
    component: WordBankBlock,
  },

  TrueFalseBlock: {
    component: TrueFalseBlock,
  },

  FillBlanksBlock: {
    component: FillBlanksBlock,
  },

  SpeedQuizBlock: {
    component: SpeedQuizBlock,
  },

  HintLadderBlock: {
    component: HintLadderBlock,
  },

  DecisionTreeBlock: {
    component: DecisionTreeBlock,
  },
  CodeExampleBlock: {
    component: CodeExampleBlock,
  },
  SequenceBlock: {
    component: SequenceBlock,
  },
  MCQQuizBlock: {
  component: MCQQuizBlock,
  },

  DragBucketBlock: {
    component: DragBucketBlock,
  },

  ArrangeTextBlock: {
    component: ArrangeTextBlock,
  },
  ProcessFlowBlock: {
  component: ProcessFlowBlock,
  },
   ToggleExplorerBlock: {
  component: ToggleExplorerBlock,
  },
  CodeActionBlock: {
  component: CodeActionBlock,
  },
  
};

export const getBlockComponent = (componentName) => {
  return blockRegistry[componentName]?.component || null;
};

export const isRegisteredBlockComponent = (componentName) => {
  return Boolean(blockRegistry[componentName]);
};

export default blockRegistry;