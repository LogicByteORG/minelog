import { brandMark, type BrandSlug } from "@/lib/brand";

export function BrandIcon({
  slug,
  size = 20,
  className = "brand-icon",
}: {
  slug: BrandSlug;
  size?: number;
  className?: string;
}) {
  const mark = brandMark(slug);
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d={mark.path} />
    </svg>
  );
}
