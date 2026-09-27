function getText(
  values,
  index = 0
) {
  return String(
    values?.[index] ?? ""
  );
}


function getArgument(
  argumentsList,
  index = 0
) {
  return String(
    argumentsList?.[index] ?? ""
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
  values = [],
  argumentsList = []
) {
  /*
   * =========================================
   * Learner Input
   * =========================================
   */

  const text =
    getText(values, 0);

  /*
   * =========================================
   * Additional Learner Inputs
   * =========================================
   *
   * These remain supported so CodeActionBlock
   * can still be used for activities where
   * multiple learner inputs are appropriate.
   */

  const second =
    getText(values, 1);

  const third =
    getText(values, 2);


  /*
   * =========================================
   * Action Arguments
   * =========================================
   *
   * These are configured by the block/action,
   * rather than entered by the learner.
   *
   * Example:
   *
   * slice [0:5]
   *
   * arguments:
   * ["0", "5"]
   *
   * + " 🎉"
   *
   * arguments:
   * [" 🎉"]
   */

  const firstArgument =
    getArgument(
      argumentsList,
      0
    );

  const secondArgument =
    getArgument(
      argumentsList,
      1
    );


  switch (functionName) {
    /*
     * =========================================
     * Basic String
     * =========================================
     */

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


    /*
     * =========================================
     * Whitespace
     * =========================================
     */

    case "trim":
      return text.trim();


    case "trim_start":
      return text.trimStart();


    case "trim_end":
      return text.trimEnd();


    /*
     * =========================================
     * Character Access
     * =========================================
     */

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


    /*
     * =========================================
     * Reverse
     * =========================================
     */

    case "reverse":
      return Array.from(text)
        .reverse()
        .join("");


    /*
     * =========================================
     * Slice
     * =========================================
     *
     * Preferred:
     *
     * action arguments:
     * ["0", "5"]
     *
     * Produces:
     * text.slice(0, 5)
     *
     * Backwards compatibility:
     *
     * If action arguments are not supplied,
     * learner input 2 and learner input 3
     * are still supported.
     */

    case "slice": {
      const startValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      const endValue =
        secondArgument !== ""
          ? secondArgument
          : third;

      const start =
        getInteger(
          startValue,
          0
        );

      if (
        endValue.trim() === ""
      ) {
        return text.slice(
          start
        );
      }

      const end =
        getInteger(
          endValue,
          text.length
        );

      return text.slice(
        start,
        end
      );
    }


    /*
     * =========================================
     * Append
     * =========================================
     *
     * Preferred:
     *
     * action arguments:
     * [" 🎉"]
     *
     * Backwards compatibility:
     *
     * If no action argument exists,
     * learner input 2 is used.
     */

    case "append": {
      const appendValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      return (
        text +
        appendValue
      );
    }


    /*
     * =========================================
     * Contains
     * =========================================
     */

    case "contains": {
      const searchValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      return String(
        text.includes(
          searchValue
        )
      );
    }


    /*
     * =========================================
     * Starts With
     * =========================================
     */

    case "starts_with": {
      const searchValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      return String(
        text.startsWith(
          searchValue
        )
      );
    }


    /*
     * =========================================
     * Ends With
     * =========================================
     */

    case "ends_with": {
      const searchValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      return String(
        text.endsWith(
          searchValue
        )
      );
    }


    /*
     * =========================================
     * Replace
     * =========================================
     */

    case "replace": {
      const findValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      const replacementValue =
        secondArgument !== ""
          ? secondArgument
          : third;

      if (
        findValue === ""
      ) {
        return text;
      }

      return text
        .split(findValue)
        .join(
          replacementValue
        );
    }


    /*
     * =========================================
     * Count
     * =========================================
     */

    case "count": {
      const searchValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      if (
        searchValue === ""
      ) {
        return "0";
      }

      return String(
        text
          .split(
            searchValue
          )
          .length - 1
      );
    }


    /*
     * =========================================
     * Find
     * =========================================
     */

    case "find": {
      const searchValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      return String(
        text.indexOf(
          searchValue
        )
      );
    }


    /*
     * =========================================
     * Checks
     * =========================================
     */

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
     * =========================================
     * Repeat
     * =========================================
     */

    case "repeat": {
      const repeatValue =
        firstArgument !== ""
          ? firstArgument
          : second;

      const times =
        Math.max(
          0,
          getInteger(
            repeatValue,
            0
          )
        );

      return text.repeat(
        times
      );
    }


    /*
     * =========================================
     * Fallback
     * =========================================
     */

    default:
      return text;
  }
}