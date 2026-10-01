function normaliseArray(value) {
  if (Array.isArray(value)) {
    return [...value];
  }

  const text = String(value ?? "").trim();

  if (!text) {
    return [];
  }

  // Allow JSON-style arrays:
  // ["Robot", "Teddy", "Kite"]
  try {
    const parsed = JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // If it is not JSON, try comma-separated values.
  }

  return text
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item !== "");
}


/*
 * Normalise teacher-configured initial array items.
 *
 * Supports:
 *
 * [
 *   { value: "Robot" },
 *   { value: "Teddy" },
 *   { value: "Kite" }
 * ]
 *
 * and:
 *
 * ["Robot", "Teddy", "Kite"]
 */
export function normaliseInitialArray(items = []) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => {
      if (
        item &&
        typeof item === "object" &&
        !Array.isArray(item)
      ) {
        return String(item.value ?? "");
      }

      return String(item ?? "");
    })
    .filter((item) => item.trim() !== "");
}


/*
 * Display an array consistently.
 */
export function formatArray(array = []) {
  if (!Array.isArray(array)) {
    return "[]";
  }

  return JSON.stringify(array);
}


/*
 * Execute an operation against the CURRENT array state.
 *
 * Mutating operations return a new array rather than changing
 * the existing React state directly.
 *
 * Return:
 *
 * {
 *   nextArray: [...],
 *   result: "..."
 * }
 */
export function executeArrayAction(
  functionName,
  currentArray = [],
  operand = ""
) {
  const list = Array.isArray(currentArray)
    ? [...currentArray]
    : normaliseArray(currentArray);

  switch (functionName) {
    case "show":
      return {
        nextArray: list,
        result: formatArray(list),
      };

    case "append": {
      const nextArray = [
        ...list,
        operand,
      ];

      return {
        nextArray,
        result: formatArray(nextArray),
      };
    }

    case "pop": {
      if (list.length === 0) {
        return {
          nextArray: [],
          result: "",
        };
      }

      const nextArray = [...list];

      const removedValue =
        nextArray.pop();

      return {
        nextArray,
        result: String(
          removedValue ?? ""
        ),
      };
    }

    case "get":
    case "index": {
      const index =
        Number(operand);

      if (!Number.isInteger(index)) {
        return {
          nextArray: list,
          result: "Invalid index",
        };
      }

      if (
        index < 0 ||
        index >= list.length
      ) {
        return {
          nextArray: list,
          result: "Index out of range",
        };
      }

      return {
        nextArray: list,
        result: String(
          list[index] ?? ""
        ),
      };
    }

    case "length":
      return {
        nextArray: list,
        result: String(
          list.length
        ),
      };

    case "first":
      return {
        nextArray: list,
        result:
          list.length > 0
            ? String(
                list[0] ?? ""
              )
            : "",
      };

    case "last":
      return {
        nextArray: list,
        result:
          list.length > 0
            ? String(
                list[
                  list.length - 1
                ] ?? ""
              )
            : "",
      };

    default:
      return {
        nextArray: list,
        result: formatArray(list),
      };
  }
}


/*
 * Stateless compatibility function.
 *
 * calculateCodeResult() can continue calling this for places
 * that only need a calculated array result.
 *
 * Persistent append/pop operations in CodeActionBlock should
 * use executeArrayAction() instead.
 */
export function calculateArrayResult(
  functionName,
  values = [],
  argumentsList = []
) {
  const list =
    normaliseArray(values[0]);

  const operand =
    argumentsList[0] !== undefined &&
    argumentsList[0] !== ""
      ? argumentsList[0]
      : values[1] ?? "";

  const operation =
    executeArrayAction(
      functionName,
      list,
      operand
    );

  return operation.result;
}