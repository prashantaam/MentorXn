/* Round badge with the user's first initial. */
function UserAvatar({ name, size = "md" }) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <span className={`mx-avatar mx-avatar--${size}`} aria-hidden="true">
      {initial}
    </span>
  );
}

export default UserAvatar;
