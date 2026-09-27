export type Language =
  | "js"
  | "ts"
  | "c"
  | "cpp"
  | "java"
  | "kotlin"
  | "csharp"
  | "python"
  | "lua"
  | "go"
  | "rust"
  | "php"
  | "shell"
  | "sql"
  | "html"
  | "xml"
  | "css"
  | "ini"
  | "diff"
  | "csv";

export type CustomLanguage = "html" | "xml" | "ini" | "diff" | "csv";

export const LANGUAGE_LABEL: Record<Language, string> = {
  js: "JavaScript",
  ts: "TypeScript",
  c: "C",
  cpp: "C++",
  java: "Java",
  kotlin: "Kotlin",
  csharp: "C#",
  python: "Python",
  lua: "Lua",
  go: "Go",
  rust: "Rust",
  php: "PHP",
  shell: "Shell script",
  sql: "SQL",
  html: "HTML file",
  xml: "XML file",
  css: "CSS file",
  ini: "INI config",
  diff: "Diff file",
  csv: "CSV file",
};

export type TokenKind =
  | "plain"
  | "comment"
  | "string"
  | "number"
  | "keyword"
  | "literal"
  | "type"
  | "func"
  | "preproc"
  | "added"
  | "removed";

export type Token = { text: string; kind: TokenKind };

export type Block = {
  start: string;
  end: string;
  kind: "comment" | "string";
  escape: boolean;
};

export type ScanState = {
  open: Block | null;
  inTag?: boolean;
  row?: number;
  delimiter?: string;
};

export const START_STATE: ScanState = { open: null };

