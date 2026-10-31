import Image from "next/image";
import Link from "next/link";
import type { LogoSources } from "@/lib/page-settings";
import { Logo } from "../logo";

export function BrandHeader({
  name,
  showName = false,
  logo,
  href,
}: {
  name: string | null;
  // With a logo the name is hidden unless the owner turns it on, for logos that are only an icon.
  // Without a logo the page wears minelog's own mark until the owner uploads theirs.
  showName?: boolean;
  logo: LogoSources;
  href: string | null;
}) {
  const mark = (
    <>
      {logo && (
        <>
          <Image
            className="brand-logo brand-logo--light"
            src={logo.light}
            width={480}
            height={96}
            alt={name ?? ""}
            unoptimized
            priority
            draggable={false}
          />
          <Image
            className="brand-logo brand-logo--dark"
            src={logo.dark}
            width={480}
            height={96}
            alt=""
            aria-hidden="true"
            unoptimized
            priority
            draggable={false}
          />
        </>
      )}
      {/* Without a logo the page wears minelog's mark, with the owner's name as its text. */}
      {!logo && <Logo word={name ?? undefined} />}
      {name && logo && showName && <span className="brand-name">{name}</span>}
    </>
  );

  return (
    <header className="brand-head">
      <div className="grid-container brand-head__bar">
        {href ? (
          <a href={href} className="brand-head__link" target="_blank" rel="noopener noreferrer">
            {mark}
          </a>
        ) : (
          <span className="brand-head__link">{mark}</span>
        )}
      </div>
    </header>
  );
}

export function BrandFooter() {
  return (
    <footer className="brand-foot">
      <p>
        Powered by{" "}
        <Link href="/" target="_blank" rel="noopener noreferrer">
          minelog
        </Link>
      </p>
    </footer>
  );
}
