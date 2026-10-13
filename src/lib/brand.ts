import { siBuymeacoffee, siGithub, siModrinth } from "simple-icons";

export type BrandSlug = "github" | "modrinth" | "buymeacoffee";

type BrandMark = {
  title: string;
  path: string;
};

const MARKS: Record<BrandSlug, BrandMark> = {
  github: { title: siGithub.title, path: siGithub.path },
  modrinth: { title: siModrinth.title, path: siModrinth.path },
  buymeacoffee: { title: siBuymeacoffee.title, path: siBuymeacoffee.path },
};

export function brandMark(slug: BrandSlug): BrandMark {
  return MARKS[slug];
}

export function knownBrands(): BrandSlug[] {
  return Object.keys(MARKS) as BrandSlug[];
}
