function toBoolean(value) {
  const normalised =
    String(value ?? "")
      .trim()
      .toLowerCase();

  if (
    normalised === "true" ||
    normalised === "1"
  ) {
    return true;
  }

  if (
    normalised === "false" ||
    normalised === "0" ||
    normalised === ""
  ) {
    return false;
  }

  return Boolean(value);
}

export function calculateLogicResult(
  functionName,
  values = []
) {
  const firstValue =
    toBoolean(values[0]);

  const secondValue =
    toBoolean(values[1]);

  switch (functionName) {
    case "and":
      return (
        firstValue &&
        secondValue
      );

    case "or":
      return (
        firstValue ||
        secondValue
      );

    case "not":
      return !firstValue;

    default:
      return false;
  }
}