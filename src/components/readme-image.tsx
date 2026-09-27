"use client";

import { useEffect, useState } from "react";
import { checkImage, needsCheck, type Verdict } from "@/lib/image-check";

type ReadmeImageProps = { src?: string; alt?: string; title?: string };

export function ReadmeImage({ src, alt, title }: ReadmeImageProps) {
  const checking = needsCheck(src);
  const [verdict, setVerdict] = useState<Verdict | "checking">(
    checking ? "checking" : "ok",
  );

  useEffect(() => {
    if (!needsCheck(src)) return;
    let current = true;
    void checkImage(src).then((result) => {
      if (current) setVerdict(result);
    });
    return () => {
      current = false;
    };
  }, [src]);

  if (verdict === "checking") {
    return (
      <span className="readme__img-note" data-state="checking" role="status">
        Checking image
      </span>
    );
  }

  if (verdict === "adult") {
    return (
      <span className="readme__img-note" data-state="removed" role="note">
        An image was removed because it may contain adult content.
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      title={title}
      loading="lazy"
      decoding="async"
      className="readme__img"
    />
  );
}

