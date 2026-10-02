import {
   calculateStringResult,
} from "./stringFunctions";

import {
   calculateNumberResult,
} from "./numberFunctions";

import {
   calculateComparisonResult,
} from "./comparisonFunctions";

import {
   calculateLogicResult,
} from "./logicFunctions";

import {
   calculateGradeResult,
} from "./gradeCalcFunctions";

import {
   calculateArrayResult,
} from "./arrayFunctions";

import {
   createVariable,
} from "./createVariableFunctions";


export function calculateCodeResult(
   functionType,
   functionName,
   values = [],
   argumentsList = []
) {
   switch (functionType) {
      case "string":
         return calculateStringResult(
            functionName,
            values,
            argumentsList
         );

      case "number":
         return calculateNumberResult(
            functionName,
            values,
            argumentsList
         );

      case "comparison":
         return calculateComparisonResult(
            functionName,
            values,
            argumentsList
         );

      case "logic":
         return calculateLogicResult(
            functionName,
            values,
            argumentsList
         );

      case "grade_calc":
         return calculateGradeResult(
            functionName,
            values,
            argumentsList
         );

      case "array":
         return calculateArrayResult(
            functionName,
            values,
            argumentsList
         );

      case "create_variable":
         return createVariable(
            values[0],
            values[1]
         );

      default:
         return String(
            values[0] ?? ""
         );
   }
}