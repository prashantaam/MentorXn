/**
 * Create Card Functions
 *
 * Reusable data logic for cards created by CodeActionBlock.
 *
 * This file is responsible for:
 * - detecting the value type
 * - creating structured card data
 * - adding cards to the card collection
 *
 * UI/rendering remains inside CodeActionBlock.jsx.
 */


/* =========================================================
   Constants
   ========================================================= */

export const MAX_CREATED_CARDS = 6;


/* =========================================================
   Detect Value Type
   ========================================================= */

/**
 * Detect the basic programming type of a value.
 *
 * Examples:
 *
 * "hello"        -> string
 * "8"            -> number
 * "12.5"         -> number
 * "True"         -> boolean
 * "False"        -> boolean
 * "[1,2,3]"      -> list
 * '["a","b"]'    -> list
 * "[]"           -> list
 */

export function detectValueType(value) {
  const text = String(
    value ?? ""
  ).trim();


  /* -------------------------------------------------------
     Boolean
     ------------------------------------------------------- */

  if (
    /^(true|false)$/i.test(text)
  ) {
    return "boolean";
  }


  /* -------------------------------------------------------
     List
     -------------------------------------------------------

     We use JSON parsing here so something merely surrounded
     by square brackets is not automatically considered
     a valid list.

     Examples:

     [1,2,3]        -> list
     ["a","b"]      -> list
     []             -> list

     [hello]        -> not valid JSON, therefore falls
                       through to string.
  */

  if (
    text.startsWith("[") &&
    text.endsWith("]")
  ) {
    try {
      const parsed =
        JSON.parse(text);

      if (
        Array.isArray(parsed)
      ) {
        return "list";
      }
    } catch {
      /*
       * Invalid list syntax.
       *
       * Continue checking the
       * remaining value types.
       */
    }
  }


  /* -------------------------------------------------------
     Number
     ------------------------------------------------------- */

  if (
    text !== "" &&
    !Number.isNaN(
      Number(text)
    )
  ) {
    return "number";
  }


  /* -------------------------------------------------------
     String
     ------------------------------------------------------- */

  return "string";
}


/* =========================================================
   Create Structured Card Result
   ========================================================= */

/**
 * Create reusable structured card data.
 *
 * Example:
 *
 * createCardResult(
 *   "num",
 *   "[1,2,3]"
 * )
 *
 * returns:
 *
 * {
 *   variable: "num",
 *   value: "[1,2,3]",
 *   type: "list"
 * }
 *
 *
 * Another example:
 *
 * createCardResult(
 *   "name",
 *   "John"
 * )
 *
 * returns:
 *
 * {
 *   variable: "name",
 *   value: "John",
 *   type: "string"
 * }
 */

export function createCardResult(
  variable,
  value
) {
  const variableName =
    String(
      variable ?? ""
    ).trim();

  const cardValue =
    String(
      value ?? ""
    ).trim();


  /*
   * Do not create a card when both
   * variable and value are empty.
   */

  if (
    !variableName &&
    !cardValue
  ) {
    return null;
  }


  /*
   * Return structured data.
   *
   * The React renderer decides how
   * this information should appear.
   */

  return {
    variable: variableName,

    value: cardValue,

    type: detectValueType(
      cardValue
    ),
  };
}


/* =========================================================
   Create Card
   ========================================================= */

/**
 * Add a new card to the existing collection.
 *
 * Default input mapping:
 *
 * Input 1
 *   -> variable / box name
 *
 * Input 2
 *   -> value
 *
 *
 * Example:
 *
 * values:
 *
 * [
 *   "num",
 *   "[1,2,3]"
 * ]
 *
 *
 * produces:
 *
 * {
 *   variable: "num",
 *   value: "[1,2,3]",
 *   type: "list"
 * }
 *
 *
 * The input indexes are parameters so this function
 * is not permanently tied to a particular exercise.
 *
 * Later the teacher configuration can control which
 * input provides the variable and which provides
 * the value.
 */

export function createCard(
  values = [],
  currentCards = [],
  {
    variableInputIndex = 0,
    valueInputIndex = 1,
  } = {}
) {

  /* -------------------------------------------------------
     Validate card collection
     ------------------------------------------------------- */

  if (
    !Array.isArray(
      currentCards
    )
  ) {
    return [];
  }


  /* -------------------------------------------------------
     Maximum cards
     ------------------------------------------------------- */

  if (
    currentCards.length >=
    MAX_CREATED_CARDS
  ) {
    return currentCards;
  }


  /* -------------------------------------------------------
     Resolve variable input
     ------------------------------------------------------- */

  const variable =
    values[
      variableInputIndex
    ];


  /* -------------------------------------------------------
     Resolve value input
     ------------------------------------------------------- */

  const value =
    values[
      valueInputIndex
    ];


  /* -------------------------------------------------------
     Create structured card
     ------------------------------------------------------- */

  const card =
    createCardResult(
      variable,
      value
    );


  /* -------------------------------------------------------
     Nothing to create
     ------------------------------------------------------- */

  if (!card) {
    return currentCards;
  }


  /* -------------------------------------------------------
     Add snapshot
     -------------------------------------------------------

     This stores a new object.

     Changing the learner inputs later will therefore
     not modify previously created cards.
  */

  return [
    ...currentCards,
    card,
  ].slice(
    0,
    MAX_CREATED_CARDS
  );
}