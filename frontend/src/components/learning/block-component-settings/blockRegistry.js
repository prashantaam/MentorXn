import BigIdeasBlock from "../block-components/BigIdeasBlock";
import FlipCardBlock from "../block-components/FlipCardBlock";
import CodeExampleBlock from "../block-components/CodeExampleBlock";
import SequenceBlock from "../block-components/SequenceBlock";
import MCQQuizBlock from "../block-components/MCQQuizBlock";
import ProcessFlowBlock from "../block-components/ProcessFlowBlock";
import ToggleExplorerBlock from "../block-components/ToggleExplorerBlock";
import DragBucketBlock from "../block-components/DragBucketBlock";
import ArrangeTextBlock from "../block-components/ArrangeTextBlock";
import RichTextBlock from "../block-components/RichTextBlock";
import AccordionBlock from "../block-components/AccordionBlock";
import SentenceBuilderBlock from "../block-components/SentenceBuilderBlock";
import InlineGlossaryBlock from "../block-components/InlineGlossaryBlock";
import MatchingPairsBlock from "../block-components/MatchingPairsBlock";
import ExplainByStepsBlock from "../block-components/ExplainByStepsBlock";
import HierarchyBlock from "../block-components/HierarchyBlock";
import FillTheBlankBlock from "../block-components/FillTheBlankBlock";
import TrueFalseBlock from "../block-components/TrueFalseBlock";
import QandABlock from "../block-components/QandABlock";
import TryItYourselfBlock from "../block-components/TryItYourselfBlock";
import ListBlock from "../block-components/ListBlock";
import SpeedQuizBlock from "../block-components/SpeedQuizBlock";
import HintLadderBlock from "../block-components/HintLadderBlock";
import DecisionTreeBlock from "../block-components/DecisionTreeBlock";
import ExpressionStepperBlock from "../block-components/ExpressionStepperBlock";
import OperatorsBlock from "../block-components/OperatorsBlock";
import VariableBoxBlock from "../block-components/VariableBoxBlock";
import FunctionCodeBlock from "../block-components/FunctionCodeBlock";
import PracticeTerminalBlock from "../block-components/PracticeTerminalBlock";
import BuildSentenceBlock from "../block-components/BuildSentenceBlock";

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

  ExplainByStepsBlock: {
    component: ExplainByStepsBlock,
  },

  HierarchyBlock: {
    component: HierarchyBlock,
  },

  FillTheBlankBlock: {
    component: FillTheBlankBlock,
  },

  TrueFalseBlock: {
    component: TrueFalseBlock,
  },

  QandABlock: {
    component: QandABlock,
  },

  TryItYourselfBlock: {
    component: TryItYourselfBlock,
  },

  ListBlock: {
    component: ListBlock,
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

  ExpressionStepperBlock: {
    component: ExpressionStepperBlock,
  },

  OperatorsBlock: {
    component: OperatorsBlock,
  },

  VariableBoxBlock: {
    component: VariableBoxBlock,
  },

  FunctionCodeBlock: {
    component: FunctionCodeBlock,
  },

  PracticeTerminalBlock: {
    component: PracticeTerminalBlock,
  },

  BuildSentenceBlock: {
    component: BuildSentenceBlock,
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
};

export const getBlockComponent = (componentName) => {
  return blockRegistry[componentName]?.component || null;
};

export const isRegisteredBlockComponent = (componentName) => {
  return Boolean(blockRegistry[componentName]);
};

export default blockRegistry;