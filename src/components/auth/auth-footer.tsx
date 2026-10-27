export function AuthFooter() {
  return (
    <footer className="auth__footer">
      <span>&copy; {new Date().getFullYear()} minelog</span>
      <span className="site-footer__dot" aria-hidden="true" />
      <span>LogicByte Studios</span>
    </footer>
  );
}
