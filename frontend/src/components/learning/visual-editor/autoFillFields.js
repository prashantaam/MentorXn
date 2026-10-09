/*
 * Auto-filled repeaters for the block editor.
 *
 * A repeater field in a template's schema can say where its items
 * come from:
 *
 *   'auto_fill' => ['from' => 'text', 'key' => 'term']
 *
 * The repeater then follows the {{words}} in the "from" field
 * exactly: each {{word}} gets an item whose "key" is that word (for
 * {{shown|word}} the part after | is used), in the order they first
 * appear, and items whose word is no longer in the text are removed.
 * So a teacher writes the paragraph and only adds descriptions.
 *
 * A removed item is kept in a stash for the rest of the editing
 * session, so if its word comes back (e.g. a typo fixed) its
 * description comes back too.
 */
const MARKER = /\{\{([^{}]+?)\}\}/g;

const normalise = (value) => String(value ?? "").trim().toLowerCase();

/* "a {{x}} b {{shown|y}}" -> ["x", "y"] (first spelling of each, in order) */
function wordsIn(text) {
  const words = [];
  const seen = new Set();

  for (const match of String(text ?? "").matchAll(MARKER)) {
    const pieces = match[1].split("|");
    const word = pieces[pieces.length - 1].trim();
    const key = normalise(word);
    if (word && !seen.has(key)) {
      seen.add(key);
      words.push(word);
    }
  }

  return words;
}

function syncRepeater(items, words, key, stash) {
  const current = Array.isArray(items) ? items : [];
  const byWord = new Map();

  for (const item of current) {
    const word = normalise(item?.[key]);
    if (word && !byWord.has(word)) byWord.set(word, item);
  }

  const wanted = new Set(words.map(normalise));

  // Remember what is about to go, in case the word comes back.
  for (const [word, item] of byWord) {
    if (!wanted.has(word)) stash.set(word, item);
  }

  return words.map(
    (word) => byWord.get(normalise(word)) ?? stash.get(normalise(word)) ?? { [key]: word }
  );
}

/*
 * Apply every auto_fill rule in the schema to the form. Only runs
 * for a rule when its "from" text changed, so editing the repeater
 * by hand (e.g. writing a description) is left alone.
 *
 * stash: a Map the caller keeps for the editing session (useRef).
 */
export function applyAutoFill(schema, previousForm, form, stash = new Map()) {
  const fields = Array.isArray(schema?.fields) ? schema.fields : [];
  let next = form;

  for (const field of fields) {
    const rule = field?.auto_fill;
    if (field?.type !== "repeater" || !rule?.from || !rule?.key) continue;
    if (previousForm?.[rule.from] === next?.[rule.from]) continue;

    if (!stash.has(field.name)) stash.set(field.name, new Map());

    next = {
      ...next,
      [field.name]: syncRepeater(
        next?.[field.name],
        wordsIn(next?.[rule.from]),
        rule.key,
        stash.get(field.name)
      ),
    };
  }

  return next;
}
