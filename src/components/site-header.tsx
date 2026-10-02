import Link from "next/link";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr";
import { GITHUB_URL } from "@/lib/config";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="grid-container site-header__bar">
        <Link href="/" aria-label="minelog home">
          <Logo />
        </Link>
        <nav aria-label="Main">
          <Link href="/api" className="nav-button">
            API
          </Link>
          <ThemeToggle />
          <a
            href={GITHUB_URL}
            className="nav-button nav-button--icon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="minelog on GitHub"
            data-tip="View the source on GitHub"
          >
            <GithubLogo size={20} weight="fill" aria-hidden />
          </a>
        </nav>
      </div>
    </header>
  );
}
