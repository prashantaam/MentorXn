function getText(
  values,
  index = 0
) {
  return String(
    values?.[index] ?? ""
  );
}


function getInteger(
  value,
  fallback
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return fallback;
  }

  return Math.trunc(number);
}


export function calculateStringResult(
  functionName,
  values = []
) {
  const text =
    getText(values, 0);

  const second =
    getText(values, 1);

  const third =
    getText(values, 2);


  switch (functionName) {
    case "input":
      return text;


    case "length":
      return String(
        text.length
      );


    case "uppercase":
      return text.toUpperCase();


    case "lowercase":
      return text.toLowerCase();


    case "capitalize":
      if (!text) {
        return "";
      }

      return (
        text
          .charAt(0)
          .toUpperCase() +
        text
          .slice(1)
          .toLowerCase()
      );


    case "title_case":
      return text.replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase()
      );


    case "trim":
      return text.trim();


    case "trim_start":
      return text.trimStart();


    case "trim_end":
      return text.trimEnd();


    case "first_character":
      return (
        text.charAt(0) || ""
      );


    case "last_character":
      return (
        text.charAt(
          text.length - 1
        ) || ""
      );


    case "reverse":
      return Array.from(text)
        .reverse()
        .join("");


    /*
     * Input 1 = original text
     * Input 2 = start position
     * Input 3 = end position
     *
     * If Input 2 is empty:
     * start = 0
     *
     * If Input 3 is empty:
     * slice to the end.
     */

    case "slice": {
      const start =
        getInteger(
          second,
          0
        );

      if (
        third.trim() === ""
      ) {
        return text.slice(
          start
        );
      }

      const end =
        getInteger(
          third,
          text.length
        );

      return text.slice(
        start,
        end
      );
    }


    /*
     * Input 1 = original text
     * Input 2 = text to append
     */

    case "append":
      return (
        text + second
      );


    case "contains":
      return String(
        text.includes(
          second
        )
      );


    case "starts_with":
      return String(
        text.startsWith(
          second
        )
      );


    case "ends_with":
      return String(
        text.endsWith(
          second
        )
      );


    /*
     * Input 1 = original text
     * Input 2 = text to find
     * Input 3 = replacement text
     */

    case "replace":
      if (second === "") {
        return text;
      }

      return text
        .split(second)
        .join(third);


    case "count":
      if (second === "") {
        return "0";
      }

      return String(
        text
          .split(second)
          .length - 1
      );


    case "find":
      return String(
        text.indexOf(
          second
        )
      );


    case "is_empty":
      return String(
        text.length === 0
      );


    case "is_alpha":
      return String(
        /^[A-Za-z]+$/.test(
          text
        )
      );


    case "is_digit":
      return String(
        /^\d+$/.test(
          text
        )
      );


    case "is_alphanumeric":
      return String(
        /^[A-Za-z0-9]+$/.test(
          text
        )
      );


    /*
     * Input 1 = text
     * Input 2 = repeat count
     */

    case "repeat": {
      const times =
        Math.max(
          0,
          getInteger(
            second,
            0
          )
        );

      return text.repeat(
        times
      );
    }


    default:
      return text;
  }
}