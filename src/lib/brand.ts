import { siBuymeacoffee, siCurseforge, siGithub, siModrinth } from "simple-icons";

export type BrandSlug = "github" | "modrinth" | "curseforge" | "buymeacoffee";

type BrandMark = {
  title: string;
  path: string;
};

const MARKS: Record<BrandSlug, BrandMark> = {
  github: { title: siGithub.title, path: siGithub.path },
  modrinth: { title: siModrinth.title, path: siModrinth.path },
  curseforge: { title: siCurseforge.title, path: siCurseforge.path },
  buymeacoffee: { title: siBuymeacoffee.title, path: siBuymeacoffee.path },
};

export function brandMark(slug: BrandSlug): BrandMark {
  return MARKS[slug];
}

export function knownBrands(): BrandSlug[] {
  return Object.keys(MARKS) as BrandSlug[];
}
