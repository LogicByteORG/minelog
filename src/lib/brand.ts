import {
  siBuymeacoffee,
  siCurseforge,
  siDiscord,
  siGithub,
  siGooglechat,
  siGuilded,
  siMattermost,
  siModrinth,
  siTelegram,
} from "simple-icons";

export type BrandSlug =
  | "github"
  | "discord"
  | "modrinth"
  | "curseforge"
  | "buymeacoffee"
  | "googlechat"
  | "guilded"
  | "mattermost"
  | "telegram";

type BrandMark = {
  title: string;
  path: string;
};

const MARKS: Record<BrandSlug, BrandMark> = {
  github: { title: siGithub.title, path: siGithub.path },
  discord: { title: siDiscord.title, path: siDiscord.path },
  modrinth: { title: siModrinth.title, path: siModrinth.path },
  curseforge: { title: siCurseforge.title, path: siCurseforge.path },
  buymeacoffee: { title: siBuymeacoffee.title, path: siBuymeacoffee.path },
  googlechat: { title: siGooglechat.title, path: siGooglechat.path },
  guilded: { title: siGuilded.title, path: siGuilded.path },
  mattermost: { title: siMattermost.title, path: siMattermost.path },
  telegram: { title: siTelegram.title, path: siTelegram.path },
};

export function brandMark(slug: BrandSlug): BrandMark {
  return MARKS[slug];
}

export function knownBrands(): BrandSlug[] {
  return Object.keys(MARKS) as BrandSlug[];
}
