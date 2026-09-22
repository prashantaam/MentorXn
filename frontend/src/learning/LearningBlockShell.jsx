function LearningBlockShell({
  title,
  icon,
  type,
  children,
}) {
  const hasHeading =
    Boolean(title || icon);

  return (
    <section
      className={`learning-block learning-block--${type}`}
    >
      {hasHeading && (
        <header className="learning-block__header">
          {icon && (
            <div className="learning-block__icon">
              {icon}
            </div>
          )}

          {title && (
            <h2 className="learning-block__title">
              {title}
            </h2>
          )}
        </header>
      )}

      <div className="learning-block__body">
        {children}
      </div>
    </section>
  );
}

export default LearningBlockShell;