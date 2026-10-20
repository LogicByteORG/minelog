import type { ReactNode } from "react";
import { AuthFooter } from "@/components/auth/auth-footer";
import { SiteHeader } from "@/components/site-header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth">
      <SiteHeader minimal />
      <main className="auth__main">{children}</main>
      <AuthFooter />
    </div>
  );
}
