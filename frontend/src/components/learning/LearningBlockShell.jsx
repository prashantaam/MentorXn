
function LearningBlockShell({
  title,
  icon,
  subtitle,
  children,
  className = "",
}) {
  const hasHeading = Boolean(
    title || icon
  );

  return (
    <section
      className={`card ${className}`.trim()}
    >
      {hasHeading && (
        <h2>
          {icon && (
            <span aria-hidden="true">
              {icon}{" "}
            </span>
          )}

          {title}
        </h2>
      )}

      {subtitle && (
        <p className="sub">
          {subtitle}
        </p>
      )}

      {children}
    </section>
  );
}

export default LearningBlockShell;