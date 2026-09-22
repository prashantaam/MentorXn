function TeacherFooter() {
  return (
    <footer className="teacher-footer">
      <div className="teacher-footer-inner">
        <div className="teacher-footer-brand">
          🎓 MentorXn Teacher Portal
        </div>

        <p>
          Create. Teach. Inspire.
        </p>

        <p className="teacher-footer-copy">
          © {new Date().getFullYear()} MentorXn
        </p>
      </div>
    </footer>
  );
}

export default TeacherFooter;