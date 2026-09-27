import {
  calculateStringResult,
} from "./stringFunctions";

import {
  calculateNumberResult,
} from "./numberFunctions";

import {
  calculateComparisonResult,
} from "./comparisonFunctions";


export function calculateCodeResult(
  functionType,
  functionName,
  values = []
) {
  switch (functionType) {
    case "string":
      return calculateStringResult(
        functionName,
        values
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

    default:
      return String(
        values[0] ?? ""
      );
  }
}