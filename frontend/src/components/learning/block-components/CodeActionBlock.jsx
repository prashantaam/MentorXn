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

import {

   executeArrayAction,

} from "./code-functions/arrayFunctions";

/* =========================================================

     Constants

     ========================================================= */


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
   let output = String(template ?? "");

   values.forEach((value, index) => {
      output = output.replaceAll(
         `{{input${index + 1}}}`,
         String(value ?? "")
      );
   });

   argumentsList.forEach((value, index) => {
      output = output.replaceAll(
         `{{arg${index + 1}}}`,
         String(value ?? "")
      );
   });

   output = output.replaceAll(
      "{{result}}",
      String(result ?? "")
   );

   return output;
}

/* =========================================================

     Resolve Function

     ========================================================= */

function getActionFunction(action, values = []) {

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

      case "grade_calc":

         return "grade";

      case "logic":

         return (

            action.logic_function ||

            "and"

         );

      case "array":

         return (

            action.array_function ||

            "show"

         );

      case "create_variable":

         return "create_variable";

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

   if (inputType === "number") {

      const min =
         input?.min !== undefined &&
         input?.min !== null &&
         input?.min !== ""
            ? Number(input.min)
            : 0;

      const step =
         input?.step !== undefined &&
         input?.step !== null &&
         input?.step !== ""
            ? Number(input.step)
            : 1;

      const max =
         input?.max !== undefined &&
         input?.max !== null &&
         input?.max !== ""
            ? Number(input.max)
            : undefined;

      return (

         <label
            className="code-action-field code-action-field--number"
            data-visual-index={visualIndex}
         >

            {input?.label ? (
               <span>{input.label}</span>
            ) : null}

            <input
               type="number"
               min={min}
               max={max}
               step={step}
               value={value}
               onChange={(event) =>
                  onChange(event.target.value)
               }
            />

         </label>

      );

   }

   if (inputType === "range") {

      const min = Number(input?.min ?? 0);
      const max = Number(input?.max ?? 100);
      const step = Number(input?.step ?? 1);
      const currentValue = value === "" ? min : value;

      return (

         <label

            className="code-action-field code-action-field--range"

            data-visual-index={

               visualIndex

            }

         >

            {input?.label ? (

               <span>

                  {input.label}

               </span>

            ) : null}

            <div className="code-action-range">

               <input

                  type="range"

                  min={min}

                  max={max}

                  step={step}

                  value={currentValue}

                  onChange={(event) =>

                     onChange(

                        event.target.value

                     )

                  }

               />

               <strong className="code-action-range-value">

                  {currentValue}

               </strong>

            </div>

         </label>

      );

   }

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

               {input?.label ?? ""}

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

            {input?.label ?? ""}

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

function getCreatedCardIcon(type) {

   switch (type) {

      case "number":

         return "🔢";

      case "boolean":

         return "☑️";

      case "list":

         return "📋";

      case "string":

         return "🔤";

      default:

         return "📦";

   }

}

function normaliseCardValue(value) {

   if (Array.isArray(value)) {

      return value;

   }

   const text = String(value ?? "").trim();

   if (
      text.startsWith("[") &&
      text.endsWith("]")
   ) {

      try {

         const parsed = JSON.parse(text);

         if (Array.isArray(parsed)) {

            return parsed;

         }

      } catch {

         // Keep invalid JSON-style values as strings.

      }

   }

   if (text.toLowerCase() === "true") {

      return true;

   }

   if (text.toLowerCase() === "false") {

      return false;

   }

   if (
      text !== "" &&
      !Number.isNaN(Number(text))
   ) {

      return Number(text);

   }

   return value;

}

function detectCardType(value) {

   if (Array.isArray(value)) return "list";

   if (typeof value === "boolean") return "boolean";

   if (typeof value === "number") return "number";

   return "string";

}

function formatCreatedCardValue(card) {

   const value = normaliseCardValue(card?.value);

   if (Array.isArray(value)) {

      return JSON.stringify(value);

   }

   if (card?.type === "string") {

      return `"${String(value ?? "")}"`;

   }

   return String(value ?? "");

}

function formatCardTemplateValue(value) {

   if (
      Array.isArray(value) ||
      (
         value &&
         typeof value === "object"
      )
   ) {
      try {
         return JSON.stringify(value);
      } catch {
         return String(value ?? "");
      }
   }

   return String(value ?? "");

}


function getCardTemplateValue(card, path) {

   const parts = String(path ?? "")
      .trim()
      .split(".")
      .filter(Boolean);

   let current = card;

   for (const part of parts) {

      if (
         current === null ||
         current === undefined ||
         typeof current !== "object" ||
         !(part in current)
      ) {
         return "";
      }

      current = current[part];

   }

   return formatCardTemplateValue(current);

}


function applyCardTemplate(

   template,

   card

) {

   const source =
      String(template ?? "");

   if (!source.trim()) {
      return [];
   }

   /*
    * Generic JSON template resolver.
    *
    * Any property returned by a function is automatically
    * available to Card Format:
    *
    *   {{value}}
    *   {{type}}
    *   {{variable}}
    *   {{index}}
    *   {{operation}}
    *   {{anythingElse}}
    *
    * Nested values are also supported:
    *
    *   {{meta.label}}
    */
   const rendered = source.replace(

      /\{\{\s*([A-Za-z0-9_.]+)\s*\}\}/g,

      (_, path) =>
         getCardTemplateValue(
            card,
            path
         )

   );

   return rendered.split(/\r?\n/);

}


function CreatedCards({

   cards,

   template,

}) {

   if (
      !Array.isArray(cards) ||
      cards.length === 0
   ) {
      return null;
   }

   const effectiveTemplate =
      String(template ?? "").trim()
         ? String(template)
         : "{{value}}";

   /*
    * CreatedCards deliberately knows nothing about function types.
    * It renders exactly the JSON objects supplied by resultCards.
    */
   return (

      <div className="code-action-created-cards">

         {cards.map(

            (card, cardIndex) => {

               const lines =
                  applyCardTemplate(
                     effectiveTemplate,
                     card
                  );

               return (

                  <div
                     key={`created-card-${cardIndex}`}
                     className="code-action-created-card"
                  >

                     {lines.map(

                        (line, lineIndex) => (

                           <div
                              key={`created-card-${cardIndex}-line-${lineIndex}`}
                              className="code-action-created-card-row"
                           >
                              {line || "\u00A0"}
                           </div>

                        )

                     )}

                  </div>

               );

            }

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

   const buttonActions =

      actions
         .map((action, index) => ({
            action,
            index,
         }))
         .filter(
            ({ action }) =>
               action?.action_trigger !==
               "auto"
         );

   const hasButtonActions =

      buttonActions.length > 0;

   const autoActionIndex =
      actions.findIndex(
         (action) =>
            action?.action_trigger === "auto"
      );

   const autoAction =
      autoActionIndex >= 0
         ? actions[autoActionIndex]
         : null;

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

   const [

      arrayState,

      setArrayState,

   ] = useState([]);

   const [

      actionResult,

      setActionResult,

   ] = useState("");

   const [

      createdVariables,

      setCreatedVariables,

   ] = useState([]);

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
/* =======================================================

        Reset When Block Changes

        ======================================================= */

   useEffect(() => {

      setValues(

         initialValues

      );

      setArrayState([]);

      setActionResult("");

      setCreatedVariables([]);

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
      autoAction ||
      (
         selectedActionIndex !== null
            ? actions[selectedActionIndex] || null
            : null
      );

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

            !activeAction &&

            !data?.auto_calculate

         ) {

            return "";

         }

         if (

            activeAction?.action_trigger !== "auto" &&

            ["array", "create_variable"].includes(functionType)

         ) {

            return actionResult;

         }

         /*

           * Resolve only the values that are operands.

           *

           * Logic blocks can contain a dropdown between the

           * Boolean inputs, for example:

           *

           *    A checkbox | and/or dropdown | B checkbox

           *

           * The dropdown selects the function; it is NOT a

           * Boolean operand. Therefore logic calculations use

           * only checkbox values. This remains correct even if

           * the operator input is moved to another position.

           */

         let calculationValues =

            values;

         let resolvedFunctionName =
            functionName;

         if (
            activeAction?.action_trigger === "auto"
         ) {
            if (
               ["number", "comparison", "logic"].includes(functionType)
            ) {
               resolvedFunctionName =
                  String(values[1] ?? "")
                     .trim()
                     .toLowerCase();

               calculationValues = [
                  values[0],
                  values[2],
               ];
            }

            if (functionType === "grade_calc") {
               resolvedFunctionName = "grade";
               calculationValues = [values[0]];
            }
         }

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

               resolvedFunctionName,

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

         data?.auto_calculate,

         functionType,

         functionName,

         values,

         inputs,

         actionArguments,

         actionResult,

      ]);

   /* =======================================================

        Dynamic Code Display

        ======================================================= */

   const displayedCode =

      useMemo(() => {

         const template =

            data?.code_display ||

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

         data?.code_display,

         values,

         result,

         actionArguments,

      ]);

   const resultView =

      useMemo(() => {

         const template =

            data?.result_box_format ||

            "**Result:** {{result}}";

         return applyTemplate(

            template,

            values,

            result,

            actionArguments

         );

      }, [

         data?.result_box_format,

         values,

         result,

         actionArguments,

      ]);

   const cardResultData =

      useMemo(() => {

         /*
          * Card Display consumes one consistent JSON envelope.
          *
          * If a function has repeatable values, it exposes them
          * through `items`. Card Display can then render one card
          * per item without knowing which function produced them.
          */
         if (functionType === "create_variable") {

            return {
               value: createdVariables,
               type: "variables",
               items: createdVariables,
            };

         }

         /*
          * Array/List is stateful. The operation result and the
          * current array are different concepts.
          *
          * Expose both in JSON so presentation remains a teacher
          * decision rather than a React decision.
          */
         if (functionType === "array") {

            return {
               value: arrayState,
               type: "list",
               operation: functionName,
               result: actionResult,
               items: arrayState.map(
                  (item, index) => ({
                     value:
                        normaliseCardValue(item),
                     type:
                        detectCardType(
                           normaliseCardValue(item)
                        ),
                     index,
                  })
               ),
            };

         }

         if (result === "") {
            return null;
         }

         const value =
            normaliseCardValue(result);

         return {
            value,
            type: detectCardType(value),
            result: value,
         };

      }, [
         functionType,
         createdVariables,
         arrayState,
         functionName,
         actionResult,
         result,
      ]);


   const resultCards =

      useMemo(() => {

         if (
            cardResultData === null ||
            cardResultData === undefined
         ) {
            return [];
         }

         /*
          * Generic Card Display contract:
          *
          * 1. A direct array means each array entry is one card.
          * 2. An object with `items` means each item is one card.
          * 3. Any other object/value becomes one card.
          *
          * There is deliberately no function-type check here.
          */
         if (Array.isArray(cardResultData)) {
            return cardResultData;
         }

         if (Array.isArray(cardResultData?.items)) {
            return cardResultData.items;
         }

         return [cardResultData];

      }, [cardResultData]);


   const cardResultJson =

      useMemo(() => {

         try {

            return JSON.stringify(
               cardResultData,
               null,
               2
            );

         } catch {

            return String(
               cardResultData ?? ""
            );

         }

      }, [cardResultData]);


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

      const action =

         actions[index];

      if (

         action?.function_type === "array"

      ) {

         const arrayFunction =

            action?.array_function ||

            "show";

         const operand =

            values[0] ?? "";

         const operation =

            executeArrayAction(

               arrayFunction,

               arrayState,

               operand

            );

         setArrayState(

            operation.nextArray

         );

         setActionResult(

            String(

               operation.result ?? ""

            )

         );

         return;

      }

      if (action?.function_type === "create_variable") {

         const createdVariable = calculateCodeResult(

            "create_variable",

            "create_variable",

            values,

            []

         );

         if (createdVariable && typeof createdVariable === "object") {

            setCreatedVariables((currentVariables) => [

               ...currentVariables,

               createdVariable,

            ]);

            setActionResult(

               String(createdVariable.value ?? "")

            );

         }

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

         {hasButtonActions && (

            <div

               className="code-action-options"

               aria-label="Actions"

            >

               {buttonActions.map(

                  ({

                     action,

                     index,

                  }) => {

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

                           data-visual-index={

                              index

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

         )}

         {/* ===============================================

               Code Display

               Action mode:

               uses the selected action's code_example.

               Automatic mode:

               uses auto_code_example.

               =============================================== */}

         {data?.show_code_display !== false &&
            displayedCode && (

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

         {data?.show_result_box !== false &&

            (autoAction || activeAction || data?.auto_calculate) && (

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

         {data?.show_card === true && (

            <CreatedCards

               cards={resultCards}

               template={data?.card_format}

            />

         )}

      </LearningBlockShell>

   );

}

export default CodeActionBlock;
