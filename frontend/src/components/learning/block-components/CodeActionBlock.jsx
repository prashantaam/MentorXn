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

        Interaction Groups

        Each group owns its inputs and actions.

        Results remain block-level.

        ======================================================= */

   const interactionGroups =

      useMemo(

         () =>

            Array.isArray(

               data.interaction_groups

            )

               ? data.interaction_groups

               : [],

         [data.interaction_groups]

      );

   const initialGroupValues =

      useMemo(

         () =>

            interactionGroups.map(

               (group) =>

                  getInitialValues(

                     Array.isArray(group?.inputs)

                        ? group.inputs

                        : []

                  )

            ),

         [interactionGroups]

      );

   /*
    * Find the first automatic action across all groups.
    * This preserves the existing Auto action behaviour while
    * making its inputs come from the group that owns it.
    */
   const autoActionLocation =

      useMemo(() => {

         for (

            let groupIndex = 0;

            groupIndex < interactionGroups.length;

            groupIndex += 1

         ) {

            const groupActions =

               Array.isArray(

                  interactionGroups[groupIndex]?.actions

               )

                  ? interactionGroups[groupIndex].actions

                  : [];

            const actionIndex =

               groupActions.findIndex(

                  (action) =>

                     action?.action_trigger === "auto"

               );

            if (actionIndex >= 0) {

               return {

                  groupIndex,

                  actionIndex,

               };

            }

         }

         return null;

      }, [interactionGroups]);

   const autoAction =

      autoActionLocation

         ? interactionGroups[

              autoActionLocation.groupIndex

           ]?.actions?.[

              autoActionLocation.actionIndex

           ] || null

         : null;

   const automaticFunctionType =

      data?.auto_function_type ||

      "string";

   /* =======================================================

        State

        ======================================================= */

   const [

      values,

      setValues,

   ] = useState(

      initialGroupValues

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
    * A selected action now needs both coordinates because
    * action indexes restart inside every group.
    */
   const [

      selectedAction,

      setSelectedAction,

   ] = useState(null);

   /* =======================================================

        Reset When Block Changes

        ======================================================= */

   useEffect(() => {

      setValues(

         initialGroupValues

      );

      setArrayState([]);

      setActionResult("");

      setCreatedVariables([]);

      setSelectedAction(null);

   }, [

      block?.id,

      initialGroupValues,

   ]);

   /* =======================================================

        Selected Group / Action

        ======================================================= */

   const activeLocation =

      autoActionLocation ||

      selectedAction;

   const activeGroup =

      activeLocation

         ? interactionGroups[

              activeLocation.groupIndex

           ] || null

         : null;

   const activeInputs =

      Array.isArray(

         activeGroup?.inputs

      )

         ? activeGroup.inputs

         : [];

   const activeGroupValues =

      activeLocation

         ? values[

              activeLocation.groupIndex

           ] || []

         : [];

   const selectedButtonAction =

      selectedAction

         ? interactionGroups[

              selectedAction.groupIndex

           ]?.actions?.[

              selectedAction.actionIndex

           ] || null

         : null;

   const activeAction =

      autoAction ||

      selectedButtonAction;

   /* =======================================================

        Resolve Function

        ======================================================= */

   const automaticFunctionName =

      getAutomaticFunctionName(

         data,

         activeGroupValues

      );

   const functionType =

      activeAction

         ?.function_type ||

      automaticFunctionType;

   const functionName =

      activeAction

         ? getActionFunction(

               activeAction,

               activeGroupValues

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

         let calculationValues =

            activeGroupValues;

         let resolvedFunctionName =

            functionName;

         /*
          * Existing Auto behaviour is preserved, but the
          * operator and operands now come from the owning group.
          */
         if (

            activeAction?.action_trigger === "auto"

         ) {

            if (

               ["number", "comparison", "logic"].includes(functionType)

            ) {

               resolvedFunctionName =

                  String(

                     activeGroupValues[1] ?? ""

                  )

                     .trim()

                     .toLowerCase();

               calculationValues = [

                  activeGroupValues[0],

                  activeGroupValues[2],

               ];

            }

            if (

               functionType === "grade_calc"

            ) {

               resolvedFunctionName =

                  "grade";

               calculationValues = [

                  activeGroupValues[0],

               ];

            }

         }

         if (

            !activeAction &&

            functionType === "logic"

         ) {

            calculationValues =

               activeGroupValues.filter(

                  (_, index) =>

                     activeInputs[index]

                        ?.input_type ===

                     "checkbox"

               );

         } else if (

            !activeAction &&

            data?.auto_function_source === "input"

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

               activeGroupValues.filter(

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

            calculated === undefined

         ) {

            return "";

         }

         return String(

            calculated

         );

      }, [

         activeAction,

         data?.auto_calculate,

         data?.auto_function_source,

         data?.auto_function_input,

         functionType,

         functionName,

         activeGroupValues,

         activeInputs,

         actionArguments,

         actionResult,

      ]);

   /* =======================================================

        Dynamic Code Display

        Templates now resolve {{input1}}, {{input2}}, ...
        against the currently active group.

        ======================================================= */

   const displayedCode =

      useMemo(() => {

         const template =

            data?.code_display ||

            "";

         if (!template) {

            return "";

         }

         return applyTemplate(

            template,

            activeGroupValues,

            result,

            actionArguments

         );

      }, [

         data?.code_display,

         activeGroupValues,

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

            activeGroupValues,

            result,

            actionArguments

         );

      }, [

         data?.result_box_format,

         activeGroupValues,

         result,

         actionArguments,

      ]);

   /* =======================================================

        Generic Card Display

        ======================================================= */

   const cardResultData =

      useMemo(() => {

         if (

            functionType === "create_variable"

         ) {

            return {

               value: createdVariables,

               type: "variables",

               items: createdVariables,

            };

         }

         if (

            functionType === "array"

         ) {

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

         if (

            result === ""

         ) {

            return null;

         }

         const value =

            normaliseCardValue(

               result

            );

         return {

            value,

            type:

               detectCardType(value),

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

         if (

            Array.isArray(

               cardResultData

            )

         ) {

            return cardResultData;

         }

         if (

            Array.isArray(

               cardResultData?.items

            )

         ) {

            return cardResultData.items;

         }

         return [

            cardResultData,

         ];

      }, [cardResultData]);

   /* =======================================================

        Input Change

        ======================================================= */

   const handleInputChange = (

      groupIndex,

      inputIndex,

      newValue

   ) => {

      setValues(

         (currentValues) =>

            currentValues.map(

               (

                  groupValues,

                  currentGroupIndex

               ) =>

                  currentGroupIndex === groupIndex

                     ? groupValues.map(

                          (

                             currentValue,

                             currentInputIndex

                          ) =>

                             currentInputIndex === inputIndex

                                ? newValue

                                : currentValue

                       )

                     : groupValues

            )

      );

   };

   /* =======================================================

        Action Click

        The action receives ONLY the values from its own group.

        ======================================================= */

   const handleActionClick = (

      groupIndex,

      actionIndex

   ) => {

      const group =

         interactionGroups[

            groupIndex

         ];

      const groupActions =

         Array.isArray(

            group?.actions

         )

            ? group.actions

            : [];

      const action =

         groupActions[

            actionIndex

         ];

      const groupValues =

         values[

            groupIndex

         ] || [];

      setSelectedAction({

         groupIndex,

         actionIndex,

      });

      if (

         action?.function_type === "array"

      ) {

         const arrayFunction =

            action?.array_function ||

            "show";

         /*
          * The first input in THIS group is the array operand.
          *
          * Example:
          *   Add toy group    -> "Duck"
          *   Access index     -> "1"
          */
         const operand =

            groupValues[0] ?? "";

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

      if (

         action?.function_type === "create_variable"

      ) {

         const createdVariable =

            calculateCodeResult(

               "create_variable",

               "create_variable",

               groupValues,

               []

            );

         if (

            createdVariable &&

            typeof createdVariable === "object"

         ) {

            setCreatedVariables(

               (currentVariables) => [

                  ...currentVariables,

                  createdVariable,

               ]

            );

            setActionResult(

               String(

                  createdVariable.value ?? ""

               )

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

               Interaction Groups

               =============================================== */}

         {interactionGroups.length > 0 ? (

            <div className="code-action-groups">

               {interactionGroups.map(

                  (

                     group,

                     groupIndex

                  ) => {

                     const groupInputs =

                        Array.isArray(

                           group?.inputs

                        )

                           ? group.inputs

                           : [];

                     const groupActions =

                        Array.isArray(

                           group?.actions

                        )

                           ? group.actions

                           : [];

                     const groupButtonActions =

                        groupActions

                           .map(

                              (

                                 action,

                                 actionIndex

                              ) => ({

                                 action,

                                 actionIndex,

                              })

                           )

                           .filter(

                              ({

                                 action,

                              }) =>

                                 action?.action_trigger !== "auto"

                           );

                     const groupValues =

                        values[

                           groupIndex

                        ] || [];

                     return (

                        <div

                           key={`interaction-group-${groupIndex}`}

                           className="code-action-group"

                        >

                           {group?.group_label?.trim() ? (

                              <div className="code-action-group-label">

                                 {group.group_label}

                              </div>

                           ) : null}

                           {groupInputs.length > 0 && (

                              <div className="code-action-inputs">

                                 {groupInputs.map(

                                    (

                                       input,

                                       inputIndex

                                    ) => (

                                       <CodeActionInput

                                          key={`group-${groupIndex}-input-${inputIndex}`}

                                          input={input}

                                          value={

                                             groupValues[

                                                inputIndex

                                             ] ?? ""

                                          }

                                          visualIndex={

                                             inputIndex

                                          }

                                          onChange={(

                                             newValue

                                          ) =>

                                             handleInputChange(

                                                groupIndex,

                                                inputIndex,

                                                newValue

                                             )

                                          }

                                       />

                                    )

                                 )}

                              </div>

                           )}

                           {groupButtonActions.length > 0 && (

                              <div

                                 className="code-action-options"

                                 aria-label={

                                    group?.group_label?.trim()

                                       ? `${group.group_label} actions`

                                       : `Group ${groupIndex + 1} actions`

                                 }

                              >

                                 {groupButtonActions.map(

                                    ({

                                       action,

                                       actionIndex,

                                    }) => {

                                       const active =

                                          selectedAction?.groupIndex === groupIndex &&

                                          selectedAction?.actionIndex === actionIndex;

                                       return (

                                          <button

                                             key={`group-${groupIndex}-action-${actionIndex}`}

                                             type="button"

                                             className={

                                                `code-action-option${

                                                   active

                                                      ? " on"

                                                      : ""

                                                }`

                                             }

                                             data-visual-index={

                                                actionIndex

                                             }

                                             aria-pressed={

                                                active

                                             }

                                             onClick={() =>

                                                handleActionClick(

                                                   groupIndex,

                                                   actionIndex

                                                )

                                             }

                                          >

                                             {action?.label ||

                                                `Action ${

                                                   actionIndex + 1

                                                }`}

                                          </button>

                                       );

                                    }

                                 )}

                              </div>

                           )}

                        </div>

                     );

                  }

               )}

            </div>

         ) : (

            <div className="block-empty">

               No interaction groups have been configured yet.

            </div>

         )}

         {/* ===============================================

               Results

               =============================================== */}

         {data?.show_code_display !== false &&
            displayedCode && (

            <CodeDisplay

               code={

                  displayedCode

               }

            />

         )}

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
