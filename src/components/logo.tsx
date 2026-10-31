import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { IS_PREVIEW } from "@/lib/config";

export function LogoLink({
  className,
  tip,
  badge,
}: {
  className?: string;
  tip?: string;
  badge?: ReactNode;
}) {
  return (
    <Link
      href="/"
      className={className}
      aria-label={IS_PREVIEW ? "minelog home, preview build" : "minelog home"}
      data-tip={tip}
    >
      <Logo badge={badge} />
    </Link>
  );
}

// `word` replaces the wordmark, used by custom pages that show the owner's name beside the mark.
export function Logo({ badge, word }: { badge?: ReactNode; word?: string }) {
  return (
    <span className="logo">
      <span className="logo__marks" aria-hidden="true">
        <Image
          className="logo__mark logo__mark--light"
          src="/brand/minelog-black.svg"
          width={28}
          height={28}
          alt=""
          unoptimized
          priority
          draggable={false}
        />
        <Image
          className="logo__mark logo__mark--dark"
          src="/brand/minelog-white.svg"
          width={28}
          height={28}
          alt=""
          unoptimized
          priority
          draggable={false}
        />
      </span>
      <span className="logo__word">{word ?? "minelog"}</span>
      {badge}
      {IS_PREVIEW && (
        <span
          className="logo__preview"
          data-tip="Preview build. Logs saved here are deleted after 1 hour"
        >
          Preview
        </span>
      )}
    </span>
  );
}

