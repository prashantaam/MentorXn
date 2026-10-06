/*
 * Block categories come from the API (managed on /dev/block-categories).
 * Helpers for showing them and grouping templates under them.
 */

// For templates whose category is missing (or was deleted before linking).
export const UNCATEGORISED = {
  id: null,
  name: "Uncategorised",
  icon: "📦",
  color: "#d6d4cc",
};

export function categoryLabel(category) {
  const shown = category || UNCATEGORISED;
  return [shown.icon, shown.name].filter(Boolean).join(" ");
}

/*
 * Templates grouped under `categories` (already in library order), plus
 * an "Uncategorised" group at the end for templates without a known
 * category. Empty groups are dropped unless `keepEmpty` is set.
 * Returns [{ category, templates }].
 */
export function groupTemplatesByCategory(templates, categories, { keepEmpty = false } = {}) {
  const known = new Set(categories.map((category) => category.id));

  const groups = categories.map((category) => ({
    category,
    templates: templates.filter((template) => template.block_category_id === category.id),
  }));

  const orphans = templates.filter((template) => !known.has(template.block_category_id));
  if (orphans.length) groups.push({ category: UNCATEGORISED, templates: orphans });

  return keepEmpty ? groups : groups.filter((group) => group.templates.length > 0);
}
