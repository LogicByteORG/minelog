import Link from "next/link";
import { HeaderAccount } from "../auth/header-account";
import { BetaTag } from "../beta-tag";
import { LogoLink } from "../logo";
import { ThemeToggle } from "../theme-toggle";
import { DashboardTabs } from "./dashboard-tabs";

export function DashboardHeader() {
  return (
    <header className="dash-head">
      <div className="dash-wide dash-head__bar">
        <div className="dash-head__brand">
          <LogoLink badge={<BetaTag />} />
        </div>
        <DashboardTabs />
        <div className="dash-head__actions">
          <nav aria-label="Resources" className="site-header__desktop">
            <Link href="/guides" className="nav-button">
              Guides
            </Link>
            <Link href="/plugin" className="nav-button">
              Plugin
            </Link>
            <Link href="/api" className="nav-button">
              API
            </Link>
          </nav>
          <ThemeToggle />
          <HeaderAccount />
        </div>
      </div>
    </header>
  );
}
