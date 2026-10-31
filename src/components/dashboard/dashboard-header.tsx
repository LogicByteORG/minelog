import { HeaderAccount } from "../auth/header-account";
import { LogoLink } from "../logo";
import { ThemeToggle } from "../theme-toggle";
import { CreateMenu } from "./create-menu";
import { DashboardMenu } from "./dashboard-menu";
import { DashboardTabs } from "./dashboard-tabs";

export function DashboardHeader() {
  return (
    <header className="dash-head">
      <div className="dash-wide dash-head__bar">
        <div className="dash-head__brand">
          <LogoLink />
        </div>
        <DashboardTabs />
        <div className="dash-head__actions">
          <CreateMenu />
          <DashboardMenu />
          <ThemeToggle />
          <HeaderAccount />
        </div>
      </div>
    </header>
  );
}
