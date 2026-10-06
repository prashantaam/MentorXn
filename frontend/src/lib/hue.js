/*
 * Courses carry a colour either as a design-token name ("net", "web"…,
 * see --mx-c-* in styles/theme/tokens.css) or as a raw colour ("#ff9a8b",
 * what the API stores). Cards read it through the --mx-hue custom property.
 */
export function hueStyle(hue) {
  if (!hue) return undefined;

  const isRawColour = hue.startsWith("#") || hue.startsWith("rgb");
  return { "--mx-hue": isRawColour ? hue : `var(--mx-c-${hue})` };
}
