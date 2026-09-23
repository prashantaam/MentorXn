function TeacherFooter() {
  return (
    <footer className="teacher-footer">
      <div className="teacher-footer-inner">
        <div className="teacher-footer-brand">
          MentorX<sup>n</sup> Teacher Portal
        </div>

        <p>
          Create. Teach. Inspire.
        </p>

        <p className="teacher-footer-copy">
          © {new Date().getFullYear()} MentorX<sup>n</sup>
        </p>
      </div>
    </footer>
  );
}

export default TeacherFooter;