function toNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


export function calculateNumberResult(
  mode,
  values = []
) {
  const first = toNumber(
    values[0]
  );

  const second = toNumber(
    values[1]
  );

  switch (mode) {
    case "number":
      return String(first);

    case "add":
      return String(
        first + second
      );

    case "subtract":
      return String(
        first - second
      );

    case "multiply":
      return String(
        first * second
      );

    case "divide":
      if (second === 0) {
        return "Cannot divide by zero";
      }

      return String(
        first / second
      );

    case "modulus":
      if (second === 0) {
        return "Cannot divide by zero";
      }

      return String(
        first % second
      );

    case "power":
      return String(
        first ** second
      );

    case "floor_divide":
      if (second === 0) {
        return "Cannot divide by zero";
      }

      return String(
        Math.floor(
          first / second
        )
      );

    case "absolute":
      return String(
        Math.abs(first)
      );

    case "round":
      return String(
        Math.round(first)
      );

    case "floor":
      return String(
        Math.floor(first)
      );

    case "ceil":
      return String(
        Math.ceil(first)
      );

    case "minimum":
      return String(
        Math.min(
          first,
          second
        )
      );

    case "maximum":
      return String(
        Math.max(
          first,
          second
        )
      );

    case "square":
      return String(
        first ** 2
      );

    case "cube":
      return String(
        first ** 3
      );

    case "square_root":
      if (first < 0) {
        return "Invalid number";
      }

      return String(
        Math.sqrt(first)
      );

    case "increment":
      return String(
        first + 1
      );

    case "decrement":
      return String(
        first - 1
      );

    case "percentage":
      if (second === 0) {
        return "Cannot divide by zero";
      }

      return String(
        (first / second) * 100
      );

    default:
      return String(first);
  }
}