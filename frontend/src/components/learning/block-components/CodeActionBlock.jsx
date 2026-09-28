import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Prism as SyntaxHighlighter,
} from "react-syntax-highlighter";

import {
  vscDarkPlus,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import LearningBlockShell from "../block-component-settings/LearningBlockShell";
import LearningText from "../shared/LearningText";

import {
  calculateCodeResult,
} from "./code-functions";


/* =========================================================
   Constants
   ========================================================= */

const MAX_CREATED_CARDS = 6;


/* =========================================================
   Initial Values
   ========================================================= */

function getInitialValues(inputs) {
  return inputs.map((input) => {
    if (
      input?.input_type === "checkbox" &&
      (
        input?.default_value === undefined ||
        input?.default_value === null ||
        String(input.default_value).trim() === ""
      )
    ) {
      return "False";
    }

    return String(
      input?.default_value ?? ""
    );
  });
}


/* =========================================================
   Template Replacement
   ========================================================= */

function applyTemplate(
  template,
  values,
  result = "",
  argumentsList = []
) {
  let output =
    String(template ?? "");

  /*
   * Learner inputs:
   *
   * {{input1}}
   * {{input2}}
   * {{input3}}
   */

  values.forEach(
    (value, index) => {
      const token =
        new RegExp(
          `\\{\\{\\s*input${
            index + 1
          }\\s*\\}\\}`,
          "gi"
        );

      output =
        output.replace(
          token,
          String(
            value ?? ""
          )
        );
    }
  );

  /*
   * Action arguments:
   *
   * {{arg1}}
   * {{arg2}}
   * {{arg3}}
   */

  argumentsList.forEach(
    (value, index) => {
      const token =
        new RegExp(
          `\\{\\{\\s*arg${
            index + 1
          }\\s*\\}\\}`,
          "gi"
        );

      output =
        output.replace(
          token,
          String(
            value ?? ""
          )
        );
    }
  );

  output =
    output.replace(
      /\{\{\s*result\s*\}\}/gi,
      String(result ?? "")
    );

  return output;
}


/* =========================================================
   Resolve Function
   ========================================================= */

function getActionFunction(action) {
  if (!action) {
    return "";
  }

  const functionType =
    action.function_type ||
    "string";

  switch (functionType) {
    case "number":
      return (
        action.number_function ||
        "number"
      );

    case "comparison":
      return (
        action.comparison_function ||
        "equal"
      );

    case "logic":
      return (
        action.logic_function ||
        "and"
      );

    case "create_card":
      return "create_card";

    case "string":
    default:
      return (
        action.string_function ||
        "input"
      );
  }
}


/* =========================================================
   Resolve Automatic Function
   ========================================================= */

function getAutomaticFunctionName(
  data,
  values
) {
  const source =
    data?.auto_function_source ||
    "fixed";

  if (source === "input") {
    const configuredIndex =
      Number(
        data?.auto_function_input ??
        1
      );

    const valueIndex =
      Number.isFinite(
        configuredIndex
      )
        ? Math.max(
            0,
            configuredIndex - 1
          )
        : 0;

    return String(
      values[valueIndex] ?? ""
    )
      .trim()
      .toLowerCase();
  }

  return String(
    data?.auto_function_name ??
    "input"
  )
    .trim()
    .toLowerCase();
}


/* =========================================================
   Resolve Action Arguments
   ========================================================= */

function getActionArguments(action) {
  if (!action) {
    return [];
  }

  if (
    Array.isArray(
      action.arguments
    )
  ) {
    return action.arguments.map(
      (argument) => {
        if (
          argument &&
          typeof argument ===
            "object"
        ) {
          return String(
            argument.value ?? ""
          );
        }

        return String(
          argument ?? ""
        );
      }
    );
  }

  return [];
}


/* =========================================================
   Input
   ========================================================= */

function CodeActionInput({
  input,
  value,
  onChange,
  visualIndex,
}) {
  const inputType =
    input?.input_type ||
    "text";

  const dropdownOptions =
    String(input?.options ?? "")
      .split(/\r?\n/)
      .map((option) =>
        option.trim()
      )
      .filter(Boolean);

  if (inputType === "checkbox") {
    return (
      <label
        className={`code-action-field code-action-field--checkbox ${
          String(value).trim().toLowerCase() === "true"
            ? "is-true"
            : "is-false"
        }`}
        data-visual-index={
          visualIndex
        }
      >
        <input
          type="checkbox"
          checked={
            String(value)
              .trim()
              .toLowerCase() ===
            "true"
          }
          onChange={(event) =>
            onChange(
              event.target.checked
                ? "True"
                : "False"
            )
          }
        />

        <span>
          {input?.label ||
            "Input"}
        </span>
      </label>
    );
  }

  return (
    <label
      className="code-action-field"
      data-visual-index={
        visualIndex
      }
    >
      <span>
        {input?.label ||
          "Input"}
      </span>

      {inputType ===
      "dropdown" ? (
        <select
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        >
          {dropdownOptions.map(
            (option) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      ) : (
        <input
          type="text"
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
        />
      )}
    </label>
  );
}


/* =========================================================
   Code Display
   ========================================================= */

function CodeDisplay({
  code,
}) {
  return (
    <div className="code-action-code-wrapper">
      <div className="code-action-code-syntax">
        <SyntaxHighlighter
          /*
           * Syntax highlighting is visual only.
           *
           * The actual calculation continues
           * to use our JavaScript helpers.
           */
          language="text"
          style={vscDarkPlus}
          showLineNumbers={true}
          wrapLongLines={false}
          customStyle={{
            margin: 0,
            padding: "18px",
            background:
              "#1e1e1e",
            borderRadius:
              "14px",
            fontSize:
              "14px",
            lineHeight:
              "1.65",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                'Consolas, Monaco, "Courier New", monospace',
            },
          }}
        >
          {code ||
            "Choose an action to explore"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}


/* =========================================================
   Created Cards
   ========================================================= */

function CreatedCards({
  cards,
}) {
  if (
    !Array.isArray(cards) ||
    cards.length === 0
  ) {
    return null;
  }

  return (
    <div className="code-action-created-cards">
      {cards.map(
        (card, cardIndex) => (
          <div
            key={`created-card-${cardIndex}`}
            className="code-action-created-card"
          >
            {card.map(
              (
                value,
                valueIndex
              ) => (
                <div
                  key={
                    `created-card-${cardIndex}-value-${valueIndex}`
                  }
                  className="code-action-created-card-row"
                >
                  {value}
                </div>
              )
            )}
          </div>
        )
      )}
    </div>
  );
}



/* =========================================================
   Main Component
   ========================================================= */

function CodeActionBlock({
  block,
}) {
  const data =
    block?.data || {};


  /* =======================================================
     Configuration
     ======================================================= */

  const inputs =
    useMemo(
      () =>
        Array.isArray(
          data.inputs
        )
          ? data.inputs
          : [],
      [data.inputs]
    );


  const actions =
    useMemo(
      () =>
        Array.isArray(
          data.actions
        )
          ? data.actions
          : [],
      [data.actions]
    );



  const hasActions =
    actions.length > 0;

  const automaticFunctionType =
    data?.auto_function_type ||
    "string";


  const initialValues =
    useMemo(
      () =>
        getInitialValues(
          inputs
        ),
      [inputs]
    );


  /* =======================================================
     State
     ======================================================= */

  const [
    values,
    setValues,
  ] = useState(
    initialValues
  );


  /*
   * First action selected by default.
   *
   * For "Try it on your own text"
   * this means len().
   */

  const [
    selectedActionIndex,
    setSelectedActionIndex,
  ] = useState(
    actions.length > 0
      ? 0
      : null
  );


  /*
   * Create Card stores every card that
   * the learner creates.
   *
   * Maximum: 6.
   */

  const [
    createdCards,
    setCreatedCards,
  ] = useState([]);


  /* =======================================================
     Reset When Block Changes
     ======================================================= */

  useEffect(() => {
    setValues(
      initialValues
    );

    setSelectedActionIndex(
      actions.length > 0
        ? 0
        : null
    );

    setCreatedCards([]);
  }, [
    block?.id,
    initialValues,
    actions,
  ]);


  /* =======================================================
     Selected Action
     ======================================================= */

  const activeAction =
    selectedActionIndex !== null
      ? actions[
          selectedActionIndex
        ] || null
      : null;


  /* =======================================================
     Resolve Function
     ======================================================= */

  const automaticFunctionName =
    getAutomaticFunctionName(
      data,
      values
    );


  const functionType =
    activeAction
      ?.function_type ||
    automaticFunctionType;


  const functionName =
    activeAction
      ? getActionFunction(
          activeAction
        )
      : automaticFunctionName;


  const isCreateCard =
    hasActions &&
    functionType ===
      "create_card";


  /* =======================================================
     Resolve Action Arguments
     ======================================================= */

  const actionArguments =
    useMemo(
      () =>
        getActionArguments(
          activeAction
        ),
      [activeAction]
    );


  /* =======================================================
     Dynamic Result
     ======================================================= */

  const result =
    useMemo(() => {
      /*
       * Create Card does not have a
       * conventional Result section.
       */

      if (isCreateCard) {
        return "";
      }

      if (
        !activeAction &&
        !data?.auto_calculate
      ) {
        return "";
      }

      /*
       * Resolve only the values that are operands.
       *
       * Logic blocks can contain a dropdown between the
       * Boolean inputs, for example:
       *
       *   A checkbox | and/or dropdown | B checkbox
       *
       * The dropdown selects the function; it is NOT a
       * Boolean operand. Therefore logic calculations use
       * only checkbox values. This remains correct even if
       * the operator input is moved to another position.
       */
      let calculationValues =
        values;

      if (
        !activeAction &&
        functionType === "logic"
      ) {
        calculationValues =
          values.filter(
            (_, index) =>
              inputs[index]
                ?.input_type ===
              "checkbox"
          );
      } else if (
        !activeAction &&
        data?.auto_function_source ===
          "input"
      ) {
        const configuredIndex =
          Number(
            data?.auto_function_input ??
              1
          );

        const functionInputIndex =
          Number.isFinite(
            configuredIndex
          )
            ? Math.max(
                0,
                configuredIndex - 1
              )
            : 0;

        calculationValues =
          values.filter(
            (_, index) =>
              index !==
              functionInputIndex
          );
      }

      const calculated =
        calculateCodeResult(
          functionType,
          functionName,
          calculationValues,
          actionArguments
        );

      if (
        calculated === null ||
        calculated ===
          undefined
      ) {
        return "";
      }

      return String(
        calculated
      );
    }, [
      activeAction,
      isCreateCard,
      data?.auto_calculate,
      functionType,
      functionName,
      values,
      inputs,
      actionArguments,
    ]);


  /* =======================================================
     Dynamic Code Display
     ======================================================= */

  const displayedCode =
    useMemo(() => {
      const template =
        activeAction
          ?.code_example ||
        (
          data?.auto_calculate
            ? (
                data?.auto_code_example ||
                (
                  automaticFunctionType === "logic"
                    ? "result = {{input1}} {{input2}} {{input3}}"
                    : ""
                )
              )
            : ""
        ) ||
        "";

      if (!template) {
        return "";
      }

      /*
       * IMPORTANT:
       *
       * Create Card also uses the code display.
       * It simply does not use the normal Result.
       */

      return applyTemplate(
        template,
        values,
        result,
        actionArguments
      );
    }, [
      activeAction,
      data?.auto_calculate,
      data?.auto_code_example,
      automaticFunctionType,
      values,
      result,
      actionArguments,
    ]);


  const resultView =
    useMemo(() => {
      const template =
        data?.result_view ||
        "";

      if (!template) {
        return "";
      }

      return applyTemplate(
        template,
        values,
        result,
        actionArguments
      );
    }, [
      data?.result_view,
      values,
      result,
      actionArguments,
    ]);


  /* =======================================================
     Input Change
     ======================================================= */

  const handleInputChange = (
    inputIndex,
    newValue
  ) => {
    setValues(
      (currentValues) =>
        currentValues.map(
          (
            currentValue,
            index
          ) =>
            index ===
            inputIndex
              ? newValue
              : currentValue
        )
    );
  };


  /* =======================================================
     Create Card
     ======================================================= */

  const createCard = () => {
    /*
     * Ignore the click if six cards
     * have already been created.
     */

    if (
      createdCards.length >=
      MAX_CREATED_CARDS
    ) {
      return;
    }


    /*
     * Remove blank values from the card.
     */

    const cardValues =
      values
        .map(
          (value) =>
            String(
              value ?? ""
            ).trim()
        )
        .filter(
          (value) =>
            value !== ""
        );


    /*
     * Do not create an empty card.
     */

    if (
      cardValues.length === 0
    ) {
      return;
    }


    /*
     * Store a snapshot.
     *
     * Future input changes will therefore
     * not alter previously created cards.
     */

    setCreatedCards(
      (currentCards) => [
        ...currentCards,
        cardValues,
      ].slice(
        0,
        MAX_CREATED_CARDS
      )
    );
  };


  /* =======================================================
     Action Click
     ======================================================= */

  const handleActionClick = (
    index
  ) => {
    const action =
      actions[index];

    setSelectedActionIndex(
      index
    );

    if (
      action?.function_type ===
      "create_card"
    ) {
      createCard();
    }
  };


  /* =======================================================
     Render
     ======================================================= */

  return (
    <LearningBlockShell
      title={
        block?.title ||
        data.title
      }
      icon={
        block?.icon ||
        data.icon
      }
      subtitle={
        data.subtitle
      }
      className="code-action-block"
    >

      {/* ===============================================
          Inputs
          =============================================== */}

      {inputs.length > 0 ? (
        <div className="code-action-inputs">
          {inputs.map(
            (
              input,
              index
            ) => (
              <CodeActionInput
                key={`input-${index}`}
                input={input}
                value={
                  values[
                    index
                  ] ?? ""
                }
                visualIndex={
                  index
                }
                onChange={(
                  newValue
                ) =>
                  handleInputChange(
                    index,
                    newValue
                  )
                }
              />
            )
          )}
        </div>
      ) : (
        <div className="block-empty">
          No inputs have been configured yet.
        </div>
      )}


      {/* ===============================================
          Actions

          Optional. Existing action-based blocks continue
          to work exactly as before.
          =============================================== */}

      {hasActions && (
        <div
          className="code-action-options"
          aria-label="Actions"
        >
          {actions.map(
            (
              action,
              index
            ) => {
              const active =
                selectedActionIndex ===
                index;

              const createCardAction =
                action
                  ?.function_type ===
                "create_card";

              const limitReached =
                createCardAction &&
                createdCards.length >=
                  MAX_CREATED_CARDS;

              return (
                <button
                  key={`action-${index}`}
                  type="button"
                  className={
                    `code-action-option${
                      active
                        ? " on"
                        : ""
                    }`
                  }
                  data-visual-index={
                    index
                  }
                  aria-pressed={
                    active
                  }
                  disabled={
                    limitReached
                  }
                  onClick={() =>
                    handleActionClick(
                      index
                    )
                  }
                >
                  {action?.label ||
                    `Action ${
                      index + 1
                    }`}
                </button>
              );
            }
          )}
        </div>
      )}


      {/* ===============================================
          Code Display

          Action mode:
          uses the selected action's code_example.

          Automatic mode:
          uses auto_code_example.
          =============================================== */}

      {displayedCode && (
        <CodeDisplay
          code={
            displayedCode
          }
        />
      )}


      {/* ===============================================
          Result

          result_view supports the standard LearningText
          formatting:
          **bold**
          `inline code`
          [[label]]

          It also supports:
          {{input1}}, {{input2}}, ... and {{result}}
          =============================================== */}

      {!isCreateCard &&
        (
          activeAction ||
          data?.auto_calculate
        ) && (
          <div
            className="code-action-result"
            aria-live="polite"
          >
            {resultView ? (
              <LearningText
                text={
                  resultView
                }
              />
            ) : (
              <>
                <strong>
                  Result:
                </strong>

                <span
                  className={
                    String(result).toLowerCase() === "true"
                      ? "code-action-result-value is-true"
                      : String(result).toLowerCase() === "false"
                        ? "code-action-result-value is-false"
                        : "code-action-result-value"
                  }
                >
                  {result === ""
                    ? "—"
                    : result}
                </span>
              </>
            )}
          </div>
        )}


      {/* ===============================================
          Created Cards
          =============================================== */}

      {isCreateCard && (
        <CreatedCards
          cards={
            createdCards
          }
        />
      )}

    </LearningBlockShell>
  );
}

export default CodeActionBlock;