/*
 * =========================================================
 * FunctionCode - ready-made kinds
 * =========================================================
 *
 * Turns a FunctionCode block's simple settings into the
 * variables + actions its playground runs:
 *
 *   string  - string methods on the student's own text
 *   number  - number operators and functions on a and b
 *   array   - a list students change (append, pop, …)
 *   custom  - the teacher's own functions ("machines")
 *
 * Code and labels follow the chosen language, so a teacher
 * only picks which methods to show.
 * =========================================================
 */

const PY = "python";

const variable = (name, label, type, value, showFor = []) => ({
  name,
  label,
  type,
  default: String(value ?? ""),
  show: true,
  show_for: showFor.join(","),
});

const chip = (label, code, result, extra = {}) => ({
  label,
  style: "chip",
  effect: "none",
  code,
  output: "value",
  result,
  message: "",
  note: "",
  ...extra,
});

/* "length, upper" -> ["length", "upper"] (unknown keys are skipped later) */
const pickKeys = (text, fallback) => {
  const keys = String(text ?? "")
    .split(",")
    .map((key) => key.trim().toLowerCase())
    .filter(Boolean);
  return keys.length > 0 ? keys : fallback;
};

/* ---------------------------------------------------------
   String functions
   --------------------------------------------------------- */

const STRING_METHODS = {
  length: { py: ["len()", "len(text)"], js: [".length", "text.length"], result: "len(text)" },
  upper: { py: [".upper()", "text.upper()"], js: [".toUpperCase()", "text.toUpperCase()"], result: "upper(text)" },
  lower: { py: [".lower()", "text.lower()"], js: [".toLowerCase()", "text.toLowerCase()"], result: "lower(text)" },
  strip: { py: [".strip()", "text.strip()"], js: [".trim()", "text.trim()"], result: "trim(text)", note: "Removes spaces from both ends." },
  title: { py: [".title()", "text.title()"], result: "title(text)" },
  first: { py: ["[0]", "text[0]"], js: ["[0]", "text[0]"], result: "text[0]", note: "Counting starts at 0, so [0] is the first character." },
  last: { py: ["[-1]", "text[-1]"], js: ["[length - 1]", "text[text.length - 1]"], result: "last(text)" },
  slice: {
    py: ["[start:end]", "text[{{start}}:{{end}}]"],
    js: [".slice()", "text.slice({{start}}, {{end}})"],
    result: "slice(text, start, end)",
    inputs: ["start", "end"],
    note: "From index {{start}} up to (but not including) index {{end}}.",
  },
  concat: { py: ['+ "…"', 'text + "{{suffix}}"'], js: ['+ "…"', 'text + "{{suffix}}"'], result: "text + suffix", inputs: ["suffix"] },
  reverse: { py: ["[::-1]", "text[::-1]"], js: ["reverse", 'text.split("").reverse().join("")'], result: "reverse(text)" },
  replace: {
    py: [".replace()", 'text.replace("{{word}}", "{{new_word}}")'],
    js: [".replaceAll()", 'text.replaceAll("{{word}}", "{{new_word}}")'],
    result: "replace(text, word, new_word)",
    inputs: ["word", "new_word"],
  },
  includes: { py: ["in", '"{{word}}" in text'], js: [".includes()", 'text.includes("{{word}}")'], result: "contains(text, word)", inputs: ["word"] },
  find: {
    py: [".find()", 'text.find("{{word}}")'],
    js: [".indexOf()", 'text.indexOf("{{word}}")'],
    result: "find(text, word)",
    inputs: ["word"],
    note: "-1 means it wasn't found.",
  },
  count: { py: [".count()", 'text.count("{{word}}")'], js: ["count", 'text.split("{{word}}").length - 1'], result: "count(text, word)", inputs: ["word"] },
  split: { py: [".split()", 'text.split("{{sep}}")'], js: [".split()", 'text.split("{{sep}}")'], result: "split(text, sep)", inputs: ["sep"] },
  repeat: { py: ["* n", "text * {{times}}"], js: [".repeat()", "text.repeat({{times}})"], result: "repeat(text, times)", inputs: ["times"] },
};

const STRING_INPUTS = {
  start: ["start", "Start index", "number", 0],
  end: ["end", "End index", "number", 5],
  suffix: ["suffix", "Add on", "text", " 🎉"],
  word: ["word", "Word", "text", "kids"],
  new_word: ["new_word", "Replace with", "text", "friends"],
  sep: ["sep", "Split on", "text", ","],
  times: ["times", "Times", "number", 3],
};

function stringConfig(data, language) {
  const python = language === PY;
  const keys = pickKeys(data.string_methods, ["length", "upper", "lower", "first", "slice", "concat"]).filter(
    (key) => STRING_METHODS[key] && (python || STRING_METHODS[key].js)
  );

  const actions = keys.map((key) => {
    const method = STRING_METHODS[key];
    const [label, line] = python ? method.py : method.js;
    const head = python ? 'text = "{{text}}"' : 'let text = "{{text}}";';
    return chip(label, `${head}\n${line}`, method.result, { note: method.note || "" });
  });

  // Each extra input only shows for the chips that use it.
  const extraInputs = Object.entries(STRING_INPUTS)
    .map(([key, [name, label, type, fallback]]) => {
      const users = keys.filter((methodKey) => STRING_METHODS[methodKey].inputs?.includes(key));
      if (users.length === 0) return null;
      const labels = users.map((methodKey) => (python ? STRING_METHODS[methodKey].py[0] : STRING_METHODS[methodKey].js[0]));
      return variable(name, label, type, fallback, labels);
    })
    .filter(Boolean);

  return {
    variables: [variable("text", data.string_label || "Your string", "text", data.string_value ?? "Hello, kids!"), ...extraInputs],
    actions,
  };
}

/* ---------------------------------------------------------
   Number functions
   --------------------------------------------------------- */

const NUMBER_METHODS = {
  add: { label: "+", py: "{{a}} + {{b}}", js: "{{a}} + {{b}}", result: "a + b", both: true },
  subtract: { label: "-", py: "{{a}} - {{b}}", js: "{{a}} - {{b}}", result: "a - b", both: true },
  multiply: { label: "*", py: "{{a}} * {{b}}", js: "{{a}} * {{b}}", result: "a * b", both: true },
  divide: { label: "/", py: "{{a}} / {{b}}", js: "{{a}} / {{b}}", result: "a / b", both: true },
  floor_divide: {
    label: "//",
    jsLabel: "Math.floor(a / b)",
    py: "{{a}} // {{b}}",
    js: "Math.floor({{a}} / {{b}})",
    result: "floor(a / b)",
    both: true,
    note: "Divides, then drops everything after the decimal point.",
  },
  modulo: { label: "%", py: "{{a}} % {{b}}", js: "{{a}} % {{b}}", result: "a % b", both: true, note: "The remainder after dividing {{a}} by {{b}}." },
  power: { label: "**", py: "{{a}} ** {{b}}", js: "{{a}} ** {{b}}", result: "pow(a, b)", both: true },
  max: { label: "max()", jsLabel: "Math.max()", py: "max({{a}}, {{b}})", js: "Math.max({{a}}, {{b}})", result: "max([a, b])", both: true },
  min: { label: "min()", jsLabel: "Math.min()", py: "min({{a}}, {{b}})", js: "Math.min({{a}}, {{b}})", result: "min([a, b])", both: true },
  abs: { label: "abs()", jsLabel: "Math.abs()", py: "abs({{a}})", js: "Math.abs({{a}})", result: "abs(a)" },
  round: { label: "round()", jsLabel: "Math.round()", py: "round({{a}})", js: "Math.round({{a}})", result: "round(a)" },
  floor: { label: "floor()", jsLabel: "Math.floor()", py: "import math\nmath.floor({{a}})", js: "Math.floor({{a}})", result: "floor(a)" },
  ceil: { label: "ceil()", jsLabel: "Math.ceil()", py: "import math\nmath.ceil({{a}})", js: "Math.ceil({{a}})", result: "ceil(a)" },
  sqrt: { label: "sqrt()", jsLabel: "Math.sqrt()", py: "import math\nmath.sqrt({{a}})", js: "Math.sqrt({{a}})", result: "sqrt(a)" },
  int: { label: "int()", jsLabel: "Math.trunc()", py: "int({{a}})", js: "Math.trunc({{a}})", result: "int(a)" },
  str: { label: "str()", jsLabel: "String()", py: "str({{a}})", js: "String({{a}})", result: "str(a)", note: "Now it's text, not a number." },
  type: {
    label: "type()",
    jsLabel: "typeof",
    py: "type({{a}})",
    js: "typeof {{a}}",
    result: "type(a)",
    pyResult: "\"<class '\" + type(a) + \"'>\"",
  },
};

function numberConfig(data, language) {
  const python = language === PY;
  const keys = pickKeys(data.number_methods, ["add", "subtract", "multiply", "divide", "modulo", "power", "round", "abs"]).filter(
    (key) => NUMBER_METHODS[key]
  );

  const actions = keys.map((key) => {
    const method = NUMBER_METHODS[key];
    const label = python ? method.label : method.jsLabel || method.label;
    const printedType = key === "type" && python;
    return chip(label, python ? method.py : method.js, printedType ? method.pyResult : method.result, {
      output: printedType ? "printed" : "value",
      note: method.note || "",
    });
  });

  // b only shows for the methods that use two numbers.
  const twoNumberLabels = keys
    .filter((key) => NUMBER_METHODS[key].both)
    .map((key) => (python ? NUMBER_METHODS[key].label : NUMBER_METHODS[key].jsLabel || NUMBER_METHODS[key].label));

  const variables = [variable("a", "a", "number", data.number_a ?? 7)];
  if (twoNumberLabels.length > 0) variables.push(variable("b", "b", "number", data.number_b ?? 2, twoNumberLabels));

  return { variables, actions };
}

/* ---------------------------------------------------------
   Array / list
   --------------------------------------------------------- */

function arrayConfig(data, language) {
  const python = language === PY;
  const raw = String(data.list_name ?? "").trim();
  const list = /^[A-Za-z_][A-Za-z0-9_]*$/.test(raw) ? raw : "toys";

  const button = (label, code, extra) => ({
    label,
    style: "button",
    effect: "none",
    target: list,
    value: "item",
    code,
    output: "none",
    result: "",
    message: "",
    note: "",
    ...extra,
  });

  const METHODS = {
    append: button(python ? "append()" : "push()", python ? `${list}.append("{{item}}")` : `${list}.push("{{item}}");`, {
      effect: "append",
      message: `✅ Added "{{item}}" to the end. The list now has {{len(${list})}} items.`,
    }),
    prepend: button(python ? "insert(0, …)" : "unshift()", python ? `${list}.insert(0, "{{item}}")` : `${list}.unshift("{{item}}");`, {
      effect: "prepend",
      message: `✅ Added "{{item}}" to the start. Everything else moved up one index.`,
    }),
    pop: button("pop()", python ? `${list}.pop()` : `${list}.pop();`, {
      effect: "pop",
      message: `🗑️ Removed "{{last}}" from the end.`,
    }),
    pop_first: button(python ? "pop(0)" : "shift()", python ? `${list}.pop(0)` : `${list}.shift();`, {
      effect: "pop_first",
      message: `🗑️ Removed "{{last}}" from the start. Everything else moved down one index.`,
    }),
    remove: button(python ? "remove()" : "splice()", python ? `${list}.remove("{{item}}")` : `${list}.splice(${list}.indexOf("{{item}}"), 1);`, {
      effect: "remove",
      message: `🗑️ Removed "{{item}}".`,
    }),
    get: button(`${list}[index]`, `${list}[{{index}}]`, {
      effect: "none",
      output: "value",
      result: `${list}[index]`,
      note: `Valid indexes: 0 to {{len(${list}) - 1}}`,
    }),
    length: button(python ? `len(${list})` : `${list}.length`, python ? `len(${list})` : `${list}.length`, {
      effect: "none",
      output: "value",
      result: `len(${list})`,
    }),
    includes: button(python ? "in" : "includes()", python ? `"{{item}}" in ${list}` : `${list}.includes("{{item}}")`, {
      effect: "none",
      output: "value",
      result: `contains(${list}, item)`,
    }),
    index_of: button(python ? "index()" : "indexOf()", python ? `${list}.index("{{item}}")` : `${list}.indexOf("{{item}}")`, {
      effect: "none",
      output: "value",
      result: `index_of(${list}, item)`,
    }),
    sort: button(python ? "sorted()" : "sort()", python ? `sorted(${list})` : `[...${list}].sort()`, {
      effect: "none",
      output: "value",
      result: `sorted(${list})`,
      note: "This gives a sorted copy; the list itself is unchanged.",
    }),
    reverse: button(python ? "[::-1]" : "reverse()", python ? `${list}[::-1]` : `[...${list}].reverse()`, {
      effect: "none",
      output: "value",
      result: `reverse(${list})`,
      note: "This gives a reversed copy; the list itself is unchanged.",
    }),
    reset: button("↺ Reset", `${list} = {{${list}}}`, { effect: "reset", message: "Back to the start." }),
  };

  const keys = pickKeys(data.list_methods, ["append", "pop", "get"]).filter((key) => METHODS[key]);
  const usesItem = keys.some((key) => ["append", "prepend", "remove", "includes", "index_of"].includes(key));
  const usesIndex = keys.includes("get");

  const variables = [variable(list, list, "list", data.list_items ?? "Robot, Teddy, Kite")];
  if (usesItem) variables.push(variable("item", data.list_item_label || "Item", "text", data.list_item ?? "Duck"));
  if (usesIndex) variables.push(variable("index", "Index", "number", data.list_index ?? 1));

  return {
    introCode: python ? `${list} = {{${list}}}` : `let ${list} = {{${list}}};`,
    variables,
    actions: keys.map((key) => METHODS[key]),
  };
}

/* ---------------------------------------------------------
   Custom functions ("machines")
   --------------------------------------------------------- */

const splitList = (text) =>
  String(text ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function customConfig(data, language) {
  const python = language === PY;
  const functions = (Array.isArray(data.functions) ? data.functions : []).filter((fn) =>
    /^[A-Za-z_][A-Za-z0-9_]*$/.test(String(fn?.name ?? "").trim())
  );

  const variables = [];
  const actions = functions.map((fn, fnIndex) => {
    const name = fn.name.trim();
    const label = `${name}()`;
    const params = splitList(fn.params).filter((param) => /^[A-Za-z_][A-Za-z0-9_]*$/.test(param));
    const defaults = splitList(fn.defaults);

    // Each function gets its own inputs: f0_a, f0_b, … shown only for its chip.
    const alias = {};
    params.forEach((param, paramIndex) => {
      const value = defaults[paramIndex] ?? "";
      const isNumber = /^-?\d+(\.\d+)?$/.test(value);
      const internal = `f${fnIndex}_${param}`;
      alias[param] = internal;
      variables.push(variable(internal, `${param} (${isNumber ? "number" : "string"})`, isNumber ? "number" : "text", value, [label]));
    });

    const args = params
      .map((param, paramIndex) => {
        const isNumber = /^-?\d+(\.\d+)?$/.test(defaults[paramIndex] ?? "");
        return isNumber ? `{{${param}}}` : `"{{${param}}}"`;
      })
      .join(", ");

    const printed = fn.output === "printed";
    const body = String(fn.body ?? "").replace(/\s+$/, "");
    const indent = python ? "    " : "  ";
    const bodyLines = (body || (python ? "pass" : "")).split("\n").map((line) => indent + line).join("\n");

    const code = python
      ? `def ${name}(${params.join(", ")}):\n${bodyLines}\n\n${printed ? "" : "result = "}${name}(${args})`
      : `function ${name}(${params.join(", ")}) {\n${bodyLines}\n}\n\n${printed ? "" : "const result = "}${name}(${args});`;

    return {
      label,
      style: "chip",
      effect: "none",
      code,
      output: printed ? "printed" : "value",
      result: fn.result,
      message: "",
      note: fn.note || "",
      alias,
      visualIndex: fnIndex,
    };
  });

  return { variables, actions };
}

/* ---------------------------------------------------------
   Public
   --------------------------------------------------------- */

export const KINDS = ["string", "number", "array", "custom"];

/* The block's playground setup for its kind (empty until one is chosen). */
export function buildConfig(data, language) {
  const kind = KINDS.includes(data?.kind) ? data.kind : null;

  if (kind === "string") return { kind, ...stringConfig(data, language) };
  if (kind === "number") return { kind, ...numberConfig(data, language) };
  if (kind === "array") return { kind, ...arrayConfig(data, language) };
  if (kind === "custom") return { kind, ...customConfig(data, language) };

  return { kind: null, introCode: "", variables: [], actions: [] };
}
