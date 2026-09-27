import Link from "next/link";
import { GITHUB_URL, LOGICBYTE_URL } from "@/lib/config";

const LICENSE_URL = `${GITHUB_URL}/blob/main/LICENSE`;

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="grid-container site-footer__inner">
        <div className="site-footer__about">
          <p className="site-footer__legal">
            minelog is an independent project with no connection to Mojang
            Studios or Microsoft. Minecraft is a trademark of Mojang Studios.
          </p>
          <p className="site-footer__made">
            <span>&copy; {year}</span>
            <span className="site-footer__dot" aria-hidden="true" />
            <span>
              Made by{" "}
              <a
                href={LOGICBYTE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                LogicByte Studios
              </a>
            </span>
            <span className="site-footer__dot" aria-hidden="true" />
            <a href={LICENSE_URL} target="_blank" rel="noopener noreferrer">
              PolyForm Shield License
            </a>
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="site-footer__links">
            <li>
              <Link href="/guides" className="footer-link">
                Guides
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
          </ul>
        </nav>
      </div>
    </footer>
  );
}
