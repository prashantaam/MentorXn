function parseVariableValue(value) {
   if (Array.isArray(value)) {
      return value;
   }

   const text = String(value ?? "").trim();

   // Detect JSON-style lists such as:
   // [1,2,3]
   // ["red","blue"]
   // [true,false]
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
         // Invalid JSON list — leave it as a string.
      }
   }

   return value;
}

function detectVariableType(value) {
   if (Array.isArray(value)) {
      return "list";
   }

   if (
      value !== "" &&
      !Number.isNaN(Number(value))
   ) {
      return "number";
   }

   return "string";
}

function getVariableIcon(type) {
   switch (type) {
      case "number":
         return "🔢";

      case "list":
         return "📋";

      case "string":
      default:
         return "🔤";
   }
}

export function createVariable(
   variable,
   value
) {
   const parsedValue =
      parseVariableValue(value);

   const type =
      detectVariableType(parsedValue);

   return {
      variable: String(
         variable ?? ""
      ).trim(),

      value: parsedValue,

      type,

      icon: getVariableIcon(type),
   };
}