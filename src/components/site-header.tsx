import Link from "next/link";
import { GITHUB_URL, IS_PREVIEW, MODRINTH_URL } from "@/lib/config";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="grid-container site-header__bar">
        <Link href="/" aria-label="minelog home">
          <Logo />
        </Link>
        {IS_PREVIEW && (
          <span
            className="site-header__preview"
            data-tip="Preview build. Logs saved here are deleted after 1 hour"
          >
            Preview
          </span>
        )}
        <nav aria-label="Main">
          <Link href="/api" className="nav-button">
            API
          </Link>
          <a
            href={MODRINTH_URL}
            className="nav-button site-header__modrinth"
            target="_blank"
            rel="noopener noreferrer"
            data-tip="Get the server plugin on Modrinth"
          >
            <span className="modrinth-icon" aria-hidden="true" />
            Download
          </a>
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            className="nav-button nav-button--icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="minelog on GitHub"
            data-tip="View the source on GitHub"
          >
            <span className="github-icon" aria-hidden="true" />
          </a>
        </nav>
      </div>
    </header>
  );
}
