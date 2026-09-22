function StudentFooter() {
  return (
    <footer className="student-footer">
      <div className="student-footer-inner">
        <div className="student-footer-brand">
          🌱 MentorXn
        </div>

        <p>Learn. Explore. Try. Grow.</p>

        <p className="student-footer-copy">
          © {new Date().getFullYear()} MentorXn
        </p>
      </div>
    </footer>
  );
}

export default StudentFooter;