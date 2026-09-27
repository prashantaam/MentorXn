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
    <label className="code-action-field" data-visual-index={
        visualIndex
      }>
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
           * It has no relationship to the
           * JavaScript calculation engine.
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
   * Select the first action by default.
   *
   * For the Code Quest example this means
   * len() is immediately selected.
   */

  const [
    selectedActionIndex,
    setSelectedActionIndex,
  ] = useState(
    actions.length > 0
      ? 0
      : null
  );


  /* =======================================================
     Reset When Block Changes
     ======================================================= */

  useEffect(() => {
    setValues(
      initialValues
    );

    /*
     * Always select the first configured
     * action when this block/configuration
     * is loaded or changed.
     */

    setSelectedActionIndex(
      actions.length > 0
        ? 0
        : null
    );
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
      if (!activeAction) {
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
     Action Click
     ======================================================= */

  const handleActionClick = (
    index
  ) => {
    setSelectedActionIndex(
      index
    );
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
                    aria-pressed={
                      active
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
              Dynamic Code
              =========================================== */}

          <CodeDisplay
            code={
              displayedCode
            }
          />


          {/* ===========================================
              Dynamic Result
              =========================================== */}

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