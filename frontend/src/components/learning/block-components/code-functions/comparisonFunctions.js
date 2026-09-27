function normaliseValue(value) {
  const text =
    String(value ?? "");

  if (text.trim() === "") {
    return "";
  }

  const number =
    Number(text);

  if (
    Number.isFinite(number)
  ) {
    return number;
  }

  return text;
}


export function calculateComparisonResult(
  functionName,
  values = []
) {
  const first =
    normaliseValue(
      values[0]
    );

  const second =
    normaliseValue(
      values[1]
    );


  switch (functionName) {
    case "equal":
      return String(
        first === second
      );


    case "not_equal":
      return String(
        first !== second
      );


    case "greater_than":
      return String(
        first > second
      );


    case "greater_or_equal":
      return String(
        first >= second
      );


    case "less_than":
      return String(
        first < second
      );


    case "less_or_equal":
      return String(
        first <= second
      );


    default:
      return "false";
  }
}