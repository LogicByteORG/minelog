export type Block =
  | { type: "p"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: string[] }
  | { type: "code"; text: string; caption?: string }
  | { type: "table"; head: string[]; rows: string[][] };

export type Section = { id: string; heading: string; blocks: Block[] };

export type Faq = { question: string; answer: string };

export type Guide = {
  slug: string;
  path: string;
  title: string;
  metaTitle: string;
  description: string;
  lead: string;
  updated: string;
  sections: Section[];
  faq: Faq[];
  related: string[];
};
