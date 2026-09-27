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
  return inputs.map(
    (input) =>
      String(
        input?.default_value ??
          ""
      )
  );
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

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
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

  const functionType =
    activeAction
      ?.function_type ||
    "string";


  const functionName =
    getActionFunction(
      activeAction
    );


  const isCreateCard =
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

      if (
        !activeAction ||
        isCreateCard
      ) {
        return "";
      }

      const calculated =
        calculateCodeResult(
          functionType,
          functionName,
          values,
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
      functionType,
      functionName,
      values,
      actionArguments,
    ]);


  /* =======================================================
     Dynamic Code Display
     ======================================================= */

  const displayedCode =
    useMemo(() => {
      if (!activeAction) {
        return "";
      }

      const template =
        activeAction
          ?.code_example ||
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
          =============================================== */}

      {actions.length > 0 ? (
        <>
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


          {/* ===========================================
              Code Display

              Visible for ALL action types,
              including Create Card.
              =========================================== */}

          <CodeDisplay
            code={
              displayedCode
            }
          />


          {/* ===========================================
              Normal Result

              Hidden only for Create Card.
              =========================================== */}

          {!isCreateCard && (
            <div
              className="code-action-result"
              aria-live="polite"
            >
              <strong>
                Result:
              </strong>

              <span>
                {activeAction
                  ? result === ""
                    ? "—"
                    : result
                  : "—"}
              </span>
            </div>
          )}


          {/* ===========================================
              Created Cards

              Only relevant to Create Card.
              Existing cards remain visible.
              =========================================== */}

          {isCreateCard && (
            <CreatedCards
              cards={
                createdCards
              }
            />
          )}
        </>
      ) : (
        <div className="block-empty">
          No actions have been configured yet.
        </div>
      )}

    </LearningBlockShell>
  );
}

export default CodeActionBlock;