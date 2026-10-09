import LearningText from "./LearningText";

/*
 * InfoPanel: the dotted box blocks use for explanations, results,
 * hints and answers (Word Quest's .panel). Every block uses this
 * component, so its look lives in one place:
 * styles/learning/info-panel.css.
 *
 *   <InfoPanel>Anything</InfoPanel>
 *   <InfoPanel text={item.explanation} />   // teacher text: **bold**,
 *                                           // `code`, [[label]],
 *                                           // [[green:label]] ...
 *   <InfoPanel as="li" className="my-block__hint" aria-live="polite" />
 *
 * Any other props (id, aria-*, data-visual-index, ...) go on the box.
 */
function InfoPanel({ as: Component = "div", className = "", text, children, ...rest }) {
  return (
    <Component className={`info-panel${className ? ` ${className}` : ""}`} {...rest}>
      {text !== undefined && text !== null && <LearningText as="span" text={text} />}
      {children}
    </Component>
  );
}

export default InfoPanel;
