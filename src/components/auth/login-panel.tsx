"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  AFTER_LOGIN_PATH,
  LOGIN_PATH,
  type AuthProvider,
  type AuthProviderId,
} from "@/lib/auth-providers";
import { BrandIcon } from "../brand-icon";
import { Loader } from "../loader";

export function LoginPanel({
  providers,
  initialProblem,
}: {
  providers: AuthProvider[];
  initialProblem: string | null;
}) {
  const [busy, setBusy] = useState<AuthProviderId | null>(null);
  const [problem, setProblem] = useState<string | null>(initialProblem);

  const start = async (provider: AuthProviderId) => {
    setBusy(provider);
    setProblem(null);
    const { error } = await authClient.signIn.social({
      provider,
      callbackURL: AFTER_LOGIN_PATH,
      errorCallbackURL: LOGIN_PATH,
    });
    if (error) {
      setProblem("Sign-in didn't go through. Give it another try in a moment.");
      setBusy(null);
    }
  };

  return (
    <div className="auth__providers">
      {providers.map((provider) => (
        <button
          key={provider.id}
          type="button"
          className="button hollow auth__provider"
          disabled={busy !== null}
          aria-busy={busy === provider.id}
          onClick={() => void start(provider.id)}
        >
          {busy === provider.id ? (
            <Loader />
          ) : (
            <BrandIcon slug={provider.brand} size={20} />
          )}
          Continue with {provider.label}
        </button>
      ))}
      {problem && (
        <p className="auth__problem" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
