import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/auth/login-panel";
import {
  AFTER_LOGIN_PATH,
  AUTH_PROVIDERS,
  authErrorMessage,
} from "@/lib/auth-providers";
import { getSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to minelog with your GitHub or Discord account.",
  robots: { index: false, follow: false },
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const session = await getSession();
  if (session) redirect(AFTER_LOGIN_PATH);

  const { error } = await searchParams;
  const code = typeof error === "string" ? error : undefined;

  return (
    <section className="auth__card settle">
      <h1 className="auth__title">Log in to minelog</h1>
      <p className="auth__lead">
        Use the account you already have. There&apos;s no password to make up.
      </p>
      <LoginPanel providers={AUTH_PROVIDERS} initialProblem={authErrorMessage(code)} />
      <p className="auth__note">
        We only read your name, email and avatar. New here? Signing in sets up
        your account.
      </p>
      <p className="auth__legal">
        By continuing you agree to the <Link href="/terms">Terms</Link> and the{" "}
        <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </section>
  );
}
