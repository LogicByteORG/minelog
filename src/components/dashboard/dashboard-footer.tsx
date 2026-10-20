import Link from "next/link";
import { Package } from "@phosphor-icons/react/dist/ssr";
import {
  BUYMEACOFFEE_URL,
  CURSEFORGE_URL,
  GITHUB_URL,
  HANGAR_URL,
  LOGICBYTE_URL,
} from "@/lib/config";
import { BrandIcon } from "../brand-icon";
import { StatusLink } from "../status-link";

export function DashboardFooter() {
  return (
    <footer className="dash-foot">
      <div className="dash-wide dash-foot__bar">
        <p className="dash-foot__copy">
          <span>&copy; {new Date().getFullYear()} minelog</span>
          <span className="site-footer__dot" aria-hidden="true" />
          <a href={LOGICBYTE_URL} target="_blank" rel="noopener noreferrer">
            LogicByte Studios
          </a>
        </p>
        <nav aria-label="Footer" className="dash-foot__links">
          <Link href="/privacy" className="footer-link">
            Privacy
          </Link>
          <Link href="/terms" className="footer-link">
            Terms
          </Link>
          <StatusLink />
        </nav>
        <div className="dash-foot__icons">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-link--icon"
            aria-label="minelog on GitHub"
            data-tip="View the source on GitHub"
          >
            <BrandIcon slug="github" size={18} />
          </a>
          <span className="dash-foot__sep" aria-hidden="true" />
          <a
            href={CURSEFORGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-link--icon"
            aria-label="minelog on CurseForge"
            data-tip="Get it on CurseForge"
          >
            <BrandIcon slug="curseforge" size={18} />
          </a>
          <a
            href={HANGAR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-link--icon"
            aria-label="minelog on Paper Hangar"
            data-tip="Get it on Paper Hangar"
          >
            <Package size={18} aria-hidden="true" />
          </a>
          <span className="dash-foot__sep" aria-hidden="true" />
          <a
            href={BUYMEACOFFEE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link footer-link--icon"
            aria-label="Buy me a coffee"
            data-tip="Buy me a coffee"
          >
            <BrandIcon slug="buymeacoffee" size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
