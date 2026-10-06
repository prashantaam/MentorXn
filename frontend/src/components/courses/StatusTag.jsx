/* "Draft" / "Published" pill for a course (or lesson) status. */
function StatusTag({ status }) {
  const isPublished = status === "published";

  return (
    <span className={`mx-tag mx-status-tag--${isPublished ? "published" : "draft"}`}>
      {isPublished ? "Published" : "Draft"}
    </span>
  );
}

export default StatusTag;
