function ContentBlock({
  content,
}) {
  return (
    <div
      className="content-block"
      dangerouslySetInnerHTML={{
        __html: content,
      }}
    />
  );
}

export default ContentBlock;