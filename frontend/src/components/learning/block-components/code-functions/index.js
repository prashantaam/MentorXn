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
        values
      );

    case "comparison":
      return calculateComparisonResult(
        functionName,
        values
      );

    case "logic":
    return calculateLogicResult(
        functionName,
        values
    );

    default:
      return String(
        values[0] ?? ""
      );
  }
}