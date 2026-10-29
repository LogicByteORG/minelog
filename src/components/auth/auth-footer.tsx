import { LOGICBYTE_URL } from "@/lib/config";

export function AuthFooter() {
  return (
    <footer className="auth__footer">
      <span>&copy; {new Date().getFullYear()} minelog</span>
      <span className="site-footer__dot" aria-hidden="true" />
      <a href={LOGICBYTE_URL} target="_blank" rel="noopener noreferrer">
        LogicByte Studios
      </a>
    </footer>
  );
}
