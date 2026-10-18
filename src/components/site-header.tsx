import Link from "next/link";
import { GITHUB_URL } from "@/lib/config";
import { BrandIcon } from "./brand-icon";
import { DownloadMenu } from "./download-menu";
import { HeaderMenu } from "./header-menu";
import { LogoLink } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader({ minimal = false }: { minimal?: boolean }) {
  if (minimal) {
    return (
      <header className="site-header site-header--minimal">
        <div className="grid-container site-header__bar">
          <LogoLink tip="Share your own log" />
          <div className="site-header__actions">
            <ThemeToggle />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="site-header">
      <div className="grid-container site-header__bar">
        <LogoLink />
        <div className="site-header__actions">
          <nav aria-label="Main" className="site-header__desktop">
            <Link href="/api" className="nav-button">
              API
            </Link>
            <DownloadMenu />
            <a
              href={GITHUB_URL}
              className="nav-button nav-button--icon"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="minelog on GitHub"
              data-tip="View the source on GitHub"
            >
              <BrandIcon slug="github" size={22} />
            </a>
          </nav>
          <ThemeToggle />
          <HeaderMenu />
        </div>
      </div>
    </header>
  );
}
