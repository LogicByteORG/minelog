import Link from "next/link";
import { BUYMEACOFFEE_URL, GITHUB_URL, LOGICBYTE_URL, REPORT_EMAIL } from "@/lib/config";
import { BrandIcon } from "./brand-icon";
import { LogoLink } from "./logo";

const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;
const COMMIT_SHA = process.env.VERCEL_GIT_COMMIT_SHA ?? null;
const COMMIT_SHORT = COMMIT_SHA?.slice(0, 7) ?? null;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="grid-container site-footer__inner">
        <div className="site-footer__top">
          <LogoLink className="site-footer__brand" />
          <nav aria-label="Footer">
            <ul className="site-footer__links">
              <li>
                <Link href="/guides" className="footer-link">
                  Guides
                </Link>
              </li>
              <li>
                <Link href="/api" className="footer-link">
                  API
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="footer-link">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="footer-link">
                  Terms
                </Link>
              </li>
              <li>
                <a href={`mailto:${REPORT_EMAIL}`} className="footer-link">
                  Report abuse
                </a>
              </li>
              <li>
                <a
                  href={BUYMEACOFFEE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-link footer-link--icon"
                  aria-label="Buy me a coffee"
                  data-tip="Buy me a coffee"
                >
                  <BrandIcon slug="buymeacoffee" size={16} />
                </a>
              </li>
            </ul>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <p className="site-footer__legal">
            minelog is an independent project with no connection to Mojang
            Studios or Microsoft. Minecraft is a trademark of Mojang Studios.
          </p>
          <p className="site-footer__meta">
            <span>&copy; {year} minelog</span>
            <span className="site-footer__dot" aria-hidden="true" />
            <a href={LOGICBYTE_URL} target="_blank" rel="noopener noreferrer">
              LogicByte Studios
            </a>
            <span className="site-footer__dot" aria-hidden="true" />
            <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
              PolyForm Shield License
            </a>
            {COMMIT_SHORT && (
              <>
                <span className="site-footer__dot" aria-hidden="true" />
                <a
                  href={`${GITHUB_URL}/commit/${COMMIT_SHA}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  build {COMMIT_SHORT}
                </a>
              </>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
