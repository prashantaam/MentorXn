function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

export function calculateConditionalResult(
  functionName,
  values = []
) {
  const value = toNumber(values[0]);

  switch (functionName) {
    case "grade":
      if (value >= 90) {
        return "A 🏆";
      }

      if (value >= 75) {
        return "B 👍";
      }

      if (value >= 50) {
        return "C 🙂";
      }

      return "F ❌";

    default:
      return "";
  }
}