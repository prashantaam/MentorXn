/*
 * =========================================================
 * FunctionCode - safe formula engine
 * =========================================================
 *
 * Teachers write small formulas such as
 *
 *   upper(text)      toys[index]      a + b
 *   len(toys)        repeat("⭐", n)   number % 2 == 0
 *
 * They are parsed and evaluated here by a tiny interpreter.
 * Nothing is passed to eval() / new Function(), so teacher
 * content can never run arbitrary code in a student's browser.
 *
 * Results follow the chosen language's rules where students
 * would notice: Python raises IndexError / ZeroDivisionError,
 * JavaScript gives undefined / Infinity, and so on.
 * =========================================================
 */

/* ---------- errors ---------- */

/* A mistake in the teacher's formula (shown as a setup warning). */
export class FormulaError extends Error {}

/* A runtime error the student caused, e.g. "IndexError: …". */
export class RuntimeCodeError extends Error {}

/* ---------- Python floats ---------- */

/*
 * JavaScript has one number type; Python shows 6 / 2 as 3.0.
 * In Python mode, float results are wrapped so they print right.
 */
class PyFloat {
  constructor(value) {
    this.value = value;
  }
}

const isNumber = (value) => typeof value === "number" || value instanceof PyFloat;
const toNum = (value) => (value instanceof PyFloat ? value.value : value);

/* ---------- tokenizer ---------- */

const OPERATORS = ["==", "!=", "<=", ">=", "&&", "||", "<", ">", "+", "-", "*", "/", "%", "!", "(", ")", "[", "]", ","];

function tokenize(source) {
  const tokens = [];
  let i = 0;

  while (i < source.length) {
    const char = source[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    // number
    const number = /^\d+(\.\d+)?/.exec(source.slice(i));
    if (number) {
      tokens.push({ type: "num", value: number[0] });
      i += number[0].length;
      continue;
    }

    // string
    if (char === '"' || char === "'") {
      let value = "";
      let j = i + 1;
      while (j < source.length && source[j] !== char) {
        if (source[j] === "\\" && j + 1 < source.length) {
          const next = source[j + 1];
          value += next === "n" ? "\n" : next === "t" ? "\t" : next;
          j += 2;
        } else {
          value += source[j];
          j += 1;
        }
      }
      if (j >= source.length) throw new FormulaError("A text value is missing its closing quote.");
      tokens.push({ type: "str", value });
      i = j + 1;
      continue;
    }

    // name / keyword
    const name = /^[A-Za-z_][A-Za-z0-9_]*/.exec(source.slice(i));
    if (name) {
      tokens.push({ type: "name", value: name[0] });
      i += name[0].length;
      continue;
    }

    const operator = OPERATORS.find((op) => source.startsWith(op, i));
    if (operator) {
      tokens.push({ type: "op", value: operator });
      i += operator.length;
      continue;
    }

    throw new FormulaError(`Unexpected character "${char}".`);
  }

  return tokens;
}

/* ---------- parser (precedence climbing) ---------- */

const BINARY = {
  or: 1, "||": 1,
  and: 2, "&&": 2,
  "==": 4, "!=": 4, "<": 4, ">": 4, "<=": 4, ">=": 4,
  "+": 5, "-": 5,
  "*": 6, "/": 6, "%": 6,
};

function parse(source) {
  const tokens = tokenize(source);
  let position = 0;

  const peek = () => tokens[position];
  const next = () => tokens[position++];
  const isOp = (value) => peek() && (peek().type === "op" || peek().type === "name") && peek().value === value;

  const expect = (value) => {
    if (!isOp(value)) throw new FormulaError(`Expected "${value}".`);
    next();
  };

  function parseExpression(minPrecedence = 1) {
    let left = parseUnary();

    for (;;) {
      const token = peek();
      const precedence = token && (token.type === "op" || token.type === "name") ? BINARY[token.value] : undefined;
      if (!precedence || precedence < minPrecedence) break;

      next();
      const right = parseExpression(precedence + 1);
      left = { t: "bin", op: token.value, a: left, b: right };
    }

    return left;
  }

  function parseUnary() {
    if (isOp("not") || isOp("!")) {
      next();
      // `not` binds looser than comparisons, like Python.
      return { t: "not", a: parseExpression(3) };
    }
    if (isOp("-")) {
      next();
      return { t: "neg", a: parseUnary() };
    }
    return parsePostfix(parsePrimary());
  }

  function parsePostfix(node) {
    let current = node;

    for (;;) {
      if (isOp("(") && current.t === "var") {
        next();
        const args = [];
        if (!isOp(")")) {
          do {
            args.push(parseExpression());
          } while (isOp(",") && next());
        }
        expect(")");
        current = { t: "call", name: current.name, args };
      } else if (isOp("[")) {
        next();
        const index = parseExpression();
        expect("]");
        current = { t: "idx", obj: current, index };
      } else {
        return current;
      }
    }
  }

  function parsePrimary() {
    const token = next();
    if (!token) throw new FormulaError("The formula ends too early.");

    if (token.type === "num") return { t: "num", raw: token.value };
    if (token.type === "str") return { t: "val", v: token.value };

    if (token.type === "name") {
      if (token.value === "True" || token.value === "true") return { t: "val", v: true };
      if (token.value === "False" || token.value === "false") return { t: "val", v: false };
      if (token.value === "None" || token.value === "null") return { t: "val", v: null };
      return { t: "var", name: token.value };
    }

    if (token.value === "(") {
      const inner = parseExpression();
      expect(")");
      return inner;
    }

    if (token.value === "[") {
      const items = [];
      if (!isOp("]")) {
        do {
          items.push(parseExpression());
        } while (isOp(",") && next());
      }
      expect("]");
      return { t: "list", items };
    }

    throw new FormulaError(`Unexpected "${token.value}".`);
  }

  if (tokens.length === 0) throw new FormulaError("The formula is empty.");

  const tree = parseExpression();
  if (position < tokens.length) throw new FormulaError(`Unexpected "${tokens[position].value}".`);
  return tree;
}

const parseCache = new Map();

function parseCached(source) {
  if (!parseCache.has(source)) {
    if (parseCache.size > 500) parseCache.clear();
    try {
      parseCache.set(source, { tree: parse(source) });
    } catch (error) {
      parseCache.set(source, { error });
    }
  }
  const entry = parseCache.get(source);
  if (entry.error) throw entry.error;
  return entry.tree;
}

/* ---------- formatting ---------- */

const quoteString = (text, language) =>
  language === "python"
    ? `'${String(text).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`
    : `"${String(text).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

function formatNumber(value, language) {
  const number = toNum(value);
  if (language === "python") {
    if (Number.isNaN(number)) return "nan";
    if (!Number.isFinite(number)) return number > 0 ? "inf" : "-inf";
    if (value instanceof PyFloat && Number.isInteger(number)) return `${number}.0`;
  }
  return String(number);
}

/*
 * How a value looks.
 *   quote: true  -> as the language would show it ('hi', [1, 2], True)
 *   quote: false -> as print() would show it (hi, [1, 2], True)
 */
export function formatValue(value, language, { quote = true } = {}) {
  if (value === undefined) return "undefined";
  if (value === null) return language === "python" ? "None" : "null";
  if (typeof value === "boolean") return language === "python" ? (value ? "True" : "False") : String(value);
  if (isNumber(value)) return formatNumber(value, language);
  if (typeof value === "string") return quote ? quoteString(value, language) : value;
  if (Array.isArray(value)) return `[${value.map((item) => formatValue(item, language)).join(", ")}]`;
  return String(value);
}

/* The language's name for a value's type. */
export function typeName(value, language) {
  if (language === "python") {
    if (value === null || value === undefined) return "NoneType";
    if (typeof value === "boolean") return "bool";
    if (value instanceof PyFloat) return "float";
    if (typeof value === "number") return Number.isInteger(value) ? "int" : "float";
    if (typeof value === "string") return "str";
    if (Array.isArray(value)) return "list";
  } else {
    if (value === undefined) return "undefined";
    if (value === null || Array.isArray(value)) return "object";
    if (isNumber(value)) return "number";
    return typeof value;
  }
  return "object";
}

/* ---------- evaluation helpers ---------- */

const truthy = (value, language) => {
  if (language === "python") {
    if (Array.isArray(value)) return value.length > 0;
    if (isNumber(value)) return toNum(value) !== 0;
    return Boolean(value);
  }
  return isNumber(value) ? Boolean(toNum(value)) && !Number.isNaN(toNum(value)) : Boolean(value);
};

const equal = (a, b) => {
  if (isNumber(a) && isNumber(b)) return toNum(a) === toNum(b);
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((item, i) => equal(item, b[i]));
  return a === b;
};

const pyType = (value) => typeName(value, "python");

function arithmetic(op, a, b, language) {
  const python = language === "python";

  if (op === "+") {
    if (isNumber(a) && isNumber(b)) {
      const sum = toNum(a) + toNum(b);
      return python && (a instanceof PyFloat || b instanceof PyFloat) ? new PyFloat(sum) : sum;
    }
    if (Array.isArray(a) && Array.isArray(b) && python) return [...a, ...b];
    if (typeof a === "string" && typeof b === "string") return a + b;
    if (python) {
      throw new RuntimeCodeError(
        typeof a === "string"
          ? `TypeError: can only concatenate str (not "${pyType(b)}") to str`
          : `TypeError: unsupported operand type(s) for +: '${pyType(a)}' and '${pyType(b)}'`
      );
    }
    // JavaScript turns both sides into text: [1, 2] + [3] -> "1,23"
    const jsText = (value) =>
      Array.isArray(value) ? value.map((item) => jsText(item)).join(",") : formatValue(value, language, { quote: false });
    return jsText(a) + jsText(b);
  }

  if (op === "*") {
    if (python && (typeof a === "string" || Array.isArray(a)) && isNumber(b)) {
      const times = Math.max(0, Math.floor(toNum(b)));
      return typeof a === "string" ? a.repeat(Math.min(times, 1000)) : Array.from({ length: Math.min(times, 200) }, () => a).flat();
    }
    if (!isNumber(a) || !isNumber(b)) {
      if (python) throw new RuntimeCodeError(`TypeError: can't multiply '${pyType(a)}' by '${pyType(b)}'`);
      return NaN;
    }
    const product = toNum(a) * toNum(b);
    return python && (a instanceof PyFloat || b instanceof PyFloat) ? new PyFloat(product) : product;
  }

  if (!isNumber(a) || !isNumber(b)) {
    if (python) throw new RuntimeCodeError(`TypeError: unsupported operand type(s) for ${op}: '${pyType(a)}' and '${pyType(b)}'`);
    return NaN;
  }

  const x = toNum(a);
  const y = toNum(b);
  const float = python && (a instanceof PyFloat || b instanceof PyFloat);

  if (op === "-") return float ? new PyFloat(x - y) : x - y;

  if (op === "/") {
    if (python) {
      if (y === 0) throw new RuntimeCodeError("ZeroDivisionError: division by zero");
      return new PyFloat(x / y);
    }
    return x / y;
  }

  if (op === "%") {
    if (python) {
      if (y === 0) throw new RuntimeCodeError("ZeroDivisionError: integer modulo by zero");
      const remainder = ((x % y) + y) % y;
      return float ? new PyFloat(remainder) : remainder;
    }
    return x % y;
  }

  throw new FormulaError(`Unknown operator "${op}".`);
}

/* x[i] with each language's rules. */
function indexInto(target, rawIndex, language) {
  const isText = typeof target === "string";
  if (!isText && !Array.isArray(target)) {
    if (language === "python") throw new RuntimeCodeError(`TypeError: '${pyType(target)}' object is not subscriptable`);
    return undefined;
  }

  const index = toNum(rawIndex);
  if (!Number.isInteger(index)) {
    if (language === "python") throw new RuntimeCodeError(`TypeError: ${isText ? "string" : "list"} indices must be integers`);
    return undefined;
  }

  if (language === "python") {
    const position = index < 0 ? target.length + index : index;
    if (position < 0 || position >= target.length) {
      throw new RuntimeCodeError(`IndexError: ${isText ? "string" : "list"} index out of range`);
    }
    return target[position];
  }

  return index >= 0 && index < target.length ? target[index] : undefined;
}

function needSequence(name, value, language) {
  if (typeof value === "string" || Array.isArray(value)) return;
  if (language === "python") throw new RuntimeCodeError(`TypeError: object of type '${pyType(value)}' has no ${name}()`);
  throw new RuntimeCodeError(`TypeError: ${name}() needs text or a list`);
}

/* The built-in functions formulas may call. */
const FUNCTIONS = {
  len: ([x], language) => {
    needSequence("len", x, language);
    return x.length;
  },
  upper: ([s]) => String(s).toUpperCase(),
  lower: ([s]) => String(s).toLowerCase(),
  trim: ([s]) => String(s).trim(),
  title: ([s]) => String(s).toLowerCase().replace(/(^|[^A-Za-z])([a-z])/g, (_, before, letter) => before + letter.toUpperCase()),
  reverse: ([x]) => (Array.isArray(x) ? [...x].reverse() : Array.from(String(x)).reverse().join("")),
  repeat: ([s, n]) => String(s).repeat(Math.max(0, Math.min(1000, Math.floor(toNum(n) || 0)))),
  at: ([x, i], language) => indexInto(x, i, language),
  slice: ([x, start, end], language) => {
    needSequence("slice", x, language);
    return x.slice(toNum(start ?? 0), end === undefined ? undefined : toNum(end));
  },
  first: ([x], language) => indexInto(x, 0, language),
  last: ([x], language) => indexInto(x, language === "python" ? -1 : (x?.length ?? 0) - 1, language),
  contains: ([x, item]) => (Array.isArray(x) ? x.some((value) => equal(value, item)) : String(x).includes(String(item))),
  count: ([x, item]) =>
    Array.isArray(x) ? x.filter((value) => equal(value, item)).length : String(x).split(String(item)).length - 1,
  index_of: ([x, item], language) => {
    const index = Array.isArray(x) ? x.findIndex((value) => equal(value, item)) : String(x).indexOf(String(item));
    if (index === -1 && language === "python") {
      throw new RuntimeCodeError(Array.isArray(x) ? `ValueError: ${formatValue(item, language)} is not in list` : "ValueError: substring not found");
    }
    return index;
  },
  join: ([list, separator], language) =>
    (Array.isArray(list) ? list : [list]).map((item) => formatValue(item, language, { quote: false })).join(separator ?? ""),
  split: ([s, separator]) => (separator === undefined ? String(s).trim().split(/\s+/) : String(s).split(String(separator))),
  replace: ([s, from, to]) => String(s).split(String(from)).join(String(to)),
  sorted: ([list]) =>
    [...(Array.isArray(list) ? list : Array.from(String(list)))].sort((a, b) =>
      isNumber(a) && isNumber(b) ? toNum(a) - toNum(b) : String(a).localeCompare(String(b))
    ),
  sum: ([list]) => (Array.isArray(list) ? list : []).reduce((total, value) => total + (toNum(value) || 0), 0),
  min: ([list], language) => {
    if (!Array.isArray(list) || list.length === 0) {
      if (language === "python") throw new RuntimeCodeError("ValueError: min() arg is an empty sequence");
      return Infinity;
    }
    return list.reduce((a, b) => (toNum(b) < toNum(a) ? b : a));
  },
  max: ([list], language) => {
    if (!Array.isArray(list) || list.length === 0) {
      if (language === "python") throw new RuntimeCodeError("ValueError: max() arg is an empty sequence");
      return -Infinity;
    }
    return list.reduce((a, b) => (toNum(b) > toNum(a) ? b : a));
  },
  find: ([x, item]) =>
    // Like Python's str.find / JavaScript's indexOf: -1 when missing, never an error.
    Array.isArray(x) ? x.findIndex((value) => equal(value, item)) : String(x).indexOf(String(item)),
  abs: ([n]) => (n instanceof PyFloat ? new PyFloat(Math.abs(n.value)) : Math.abs(toNum(n))),
  round: ([n, digits], language) => {
    const places = Math.floor(toNum(digits ?? 0));
    const factor = 10 ** places;
    const scaled = toNum(n) * factor;

    if (language === "python") {
      // Python rounds halves to the even number: round(2.5) == 2.
      const floor = Math.floor(scaled);
      const diff = scaled - floor;
      const rounded = diff > 0.5 || (diff === 0.5 && floor % 2 !== 0) ? floor + 1 : floor;
      return digits === undefined ? rounded : new PyFloat(rounded / factor);
    }
    return Math.round(scaled) / factor;
  },
  pow: ([a, b], language) => {
    const value = toNum(a) ** toNum(b);
    const float = a instanceof PyFloat || b instanceof PyFloat || toNum(b) < 0;
    return language === "python" && float ? new PyFloat(value) : value;
  },
  sqrt: ([n], language) => {
    if (language === "python") {
      if (toNum(n) < 0) throw new RuntimeCodeError("ValueError: math domain error");
      return new PyFloat(Math.sqrt(toNum(n)));
    }
    return Math.sqrt(toNum(n));
  },
  floor: ([n]) => Math.floor(toNum(n)),
  ceil: ([n]) => Math.ceil(toNum(n)),
  str: ([x], language) => formatValue(x, language, { quote: false }),
  int: ([x], language) => {
    const number = isNumber(x) ? toNum(x) : Number(String(x).trim());
    if (Number.isNaN(number)) {
      if (language === "python") throw new RuntimeCodeError(`ValueError: invalid literal for int() with base 10: ${formatValue(x, language)}`);
      return NaN;
    }
    return Math.trunc(number);
  },
  float: ([x], language) => {
    const number = isNumber(x) ? toNum(x) : Number(String(x).trim());
    if (Number.isNaN(number) && language === "python") {
      throw new RuntimeCodeError(`ValueError: could not convert string to float: ${formatValue(x, language)}`);
    }
    return language === "python" ? new PyFloat(number) : number;
  },
  type: ([x], language) => typeName(x, language),
};

export const FUNCTION_NAMES = [...Object.keys(FUNCTIONS), "if"].sort();

function evaluateNode(node, env, language) {
  switch (node.t) {
    case "num": {
      const value = Number(node.raw);
      return language === "python" && node.raw.includes(".") ? new PyFloat(value) : value;
    }
    case "val":
      return node.v;
    case "list":
      return node.items.map((item) => evaluateNode(item, env, language));
    case "var": {
      if (!Object.prototype.hasOwnProperty.call(env, node.name)) {
        throw new RuntimeCodeError(
          language === "python"
            ? `NameError: name '${node.name}' is not defined`
            : `ReferenceError: ${node.name} is not defined`
        );
      }
      return env[node.name];
    }
    case "neg": {
      const value = evaluateNode(node.a, env, language);
      if (!isNumber(value)) {
        if (language === "python") throw new RuntimeCodeError(`TypeError: bad operand type for unary -: '${pyType(value)}'`);
        return NaN;
      }
      return value instanceof PyFloat ? new PyFloat(-value.value) : -value;
    }
    case "not":
      return !truthy(evaluateNode(node.a, env, language), language);
    case "idx":
      return indexInto(evaluateNode(node.obj, env, language), evaluateNode(node.index, env, language), language);
    case "call": {
      // if(condition, then, otherwise) only evaluates the branch it needs.
      if (node.name === "if") {
        if (node.args.length !== 3) throw new FormulaError("if() needs 3 parts: if(condition, then, otherwise).");
        return truthy(evaluateNode(node.args[0], env, language), language)
          ? evaluateNode(node.args[1], env, language)
          : evaluateNode(node.args[2], env, language);
      }
      const fn = FUNCTIONS[node.name];
      if (!fn) throw new FormulaError(`Unknown function ${node.name}(). Available: ${FUNCTION_NAMES.join(", ")}.`);
      return fn(node.args.map((arg) => evaluateNode(arg, env, language)), language);
    }
    case "bin": {
      const { op } = node;

      if (op === "and" || op === "&&") {
        return truthy(evaluateNode(node.a, env, language), language) && truthy(evaluateNode(node.b, env, language), language);
      }
      if (op === "or" || op === "||") {
        return truthy(evaluateNode(node.a, env, language), language) || truthy(evaluateNode(node.b, env, language), language);
      }

      const a = evaluateNode(node.a, env, language);
      const b = evaluateNode(node.b, env, language);

      if (op === "==") return equal(a, b);
      if (op === "!=") return !equal(a, b);
      if (["<", ">", "<=", ">="].includes(op)) {
        const x = isNumber(a) ? toNum(a) : a;
        const y = isNumber(b) ? toNum(b) : b;
        return op === "<" ? x < y : op === ">" ? x > y : op === "<=" ? x <= y : x >= y;
      }

      return arithmetic(op, a, b, language);
    }
    default:
      throw new FormulaError("Unknown formula part.");
  }
}

/* Evaluate one formula. Throws FormulaError or RuntimeCodeError. */
export function evaluate(source, env, language) {
  return evaluateNode(parseCached(String(source ?? "")), env, language);
}

/*
 * Fill {{ formula }} placeholders in a template. Values are
 * inserted as print() would show them (text without quotes).
 * Errors are inserted inline so the teacher can see them.
 */
export function renderTemplate(template, env, language) {
  return String(template ?? "").replace(/\{\{([\s\S]+?)\}\}/g, (_, source) => {
    try {
      return formatValue(evaluate(source.trim(), env, language), language, { quote: false });
    } catch (error) {
      return `⚠ ${error.message}`;
    }
  });
}
