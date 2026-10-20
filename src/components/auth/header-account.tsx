"use client";

import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { createPortal } from "react-dom";
import { SignOut, SquaresFour, User } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";
import { DASHBOARD_PATH, LOGIN_PATH } from "@/lib/auth-providers";
import { useFloatingMenu } from "@/lib/use-floating-menu";
import { useSignOut } from "@/lib/use-sign-out";

type AccountUser = { name: string; email: string; image?: string | null };

function Avatar({ user }: { user: AccountUser }) {
  if (!user.image) return <User size={20} aria-hidden="true" />;
  return (
    <Image
      className="account__avatar"
      src={user.image}
      width={28}
      height={28}
      alt=""
      unoptimized
      draggable={false}
    />
  );
}

function AccountMenu({ user }: { user: AccountUser }) {
  const { open, pos, button, menu, toggle, close } = useFloatingMenu<HTMLDivElement>();
  const signOut = useSignOut();

  return (
    <div className="account">
      <button
        type="button"
        ref={button}
        className="nav-button nav-button--icon"
        aria-expanded={open}
        aria-controls="account-menu-panel"
        aria-label="Account menu"
        onClick={toggle}
      >
        <Avatar user={user} />
      </button>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-label="Account"
            id="account-menu-panel"
            ref={menu}
            className="site-menu__panel account__panel"
            style={{ top: pos.top, "--menu-right": `${pos.right}px` } as CSSProperties}
          >
            <p className="account__who">
              <span className="account__name">{user.name}</span>
              <span className="account__email">{user.email}</span>
            </p>
            <Link href={DASHBOARD_PATH} className="site-menu__link" onClick={close}>
              <SquaresFour size={18} aria-hidden="true" />
              Dashboard
            </Link>
            <button
              type="button"
              className="site-menu__link account__action"
              onClick={() => {
                close();
                void signOut();
              }}
            >
              <SignOut size={18} aria-hidden="true" />
              Log out
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}

export function HeaderAccount() {
  const { data, isPending } = authClient.useSession();

  if (data) return <AccountMenu user={data.user} />;

  return (
    <Link
      href={LOGIN_PATH}
      className="nav-button"
      data-pending={isPending ? "" : undefined}
      aria-hidden={isPending}
      tabIndex={isPending ? -1 : undefined}
    >
      Log in
    </Link>
  );
}

export function MenuAccount({ onNavigate }: { onNavigate: () => void }) {
  const { data, isPending } = authClient.useSession();
  const signOut = useSignOut();

  if (isPending) return null;

  if (!data) {
    return (
      <Link href={LOGIN_PATH} className="site-menu__link" onClick={onNavigate}>
        <User size={18} aria-hidden="true" />
        Log in
      </Link>
    );
  }

  return (
    <>
      <Link href={DASHBOARD_PATH} className="site-menu__link" onClick={onNavigate}>
        <SquaresFour size={18} aria-hidden="true" />
        Dashboard
      </Link>
      <button
        type="button"
        className="site-menu__link account__action"
        onClick={() => {
          onNavigate();
          void signOut();
        }}
      >
        <SignOut size={18} aria-hidden="true" />
        Log out
      </button>
    </>
  );
}
