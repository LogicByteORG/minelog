"use client";

import { useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "./auth-client";
import { DASHBOARD_PATH } from "./auth-providers";

export function useSignOut() {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(async () => {
    await authClient.signOut();
    if (pathname.startsWith(DASHBOARD_PATH)) router.replace("/");
  }, [pathname, router]);
}
