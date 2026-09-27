import type { Block, CustomLanguage, Language } from "./types";

const WORDS = (list: string) => new Set(list.split(" "));
const NONE = new Set<string>();

export type Spec = {
  line: string[];
  blocks: Block[];
  quotes: string;
  keywords: Set<string>;
  literals: Set<string>;
  types: Set<string>;
  ignoreCase: boolean;
  preprocessor: boolean;
  annotations: boolean;
  calls: boolean;
  capitalTypes: boolean;
  hyphenWords?: boolean;
  keys?: boolean;
  hexColors?: boolean;
};

const COMMENT_BLOCK: Block = { start: "/*", end: "*/", kind: "comment", escape: false };
const BASE: Spec = {
  line: ["//"],
  blocks: [COMMENT_BLOCK],
  quotes: `"'`,
  keywords: NONE,
  literals: NONE,
  types: NONE,
  ignoreCase: false,
  preprocessor: false,
  annotations: false,
  calls: true,
  capitalTypes: true,
};

const JS_KEYWORDS = WORDS(
  "async await break case catch class const continue debugger default delete do else export extends finally for from function get if import in instanceof let new of return set static super switch this throw try typeof var void while with yield",
);
const JS_LITERALS = WORDS("true false null undefined NaN Infinity");
const TEMPLATE: Block = { start: "`", end: "`", kind: "string", escape: true };

const C_KEYWORDS = WORDS(
  "auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while",
);
const C_TYPES = WORDS(
  "bool char double float int long short signed unsigned void size_t ssize_t int8_t int16_t int32_t int64_t uint8_t uint16_t uint32_t uint64_t wchar_t string",
);
const C_LITERALS = WORDS("true false NULL nullptr");

const JAVA_KEYWORDS = WORDS(
  "abstract assert break case catch class const continue default do else enum extends final finally for goto if implements import instanceof interface native new package private protected public return static strictfp super switch synchronized this throw throws transient try var volatile while record sealed permits",
);
const JAVA_TYPES = WORDS(
  "boolean byte char double float int long short void String Object Integer Long Double List Map Set",
);
const TEXT_BLOCK: Block = { start: '"""', end: '"""', kind: "string", escape: true };

export const SPECS: Record<Exclude<Language, CustomLanguage>, Spec> = {
  js: {
    ...BASE,
    blocks: [COMMENT_BLOCK, TEMPLATE],
    keywords: JS_KEYWORDS,
    literals: JS_LITERALS,
    annotations: true,
  },
  ts: {
    ...BASE,
    blocks: [COMMENT_BLOCK, TEMPLATE],
    keywords: new Set([
      ...JS_KEYWORDS,
      ...WORDS(
        "abstract as declare enum implements infer interface is keyof module namespace override private protected public readonly satisfies type unique",
      ),
    ]),
    literals: JS_LITERALS,
    types: WORDS("string number boolean any unknown never void object symbol bigint"),
    annotations: true,
  },
  c: {
    ...BASE,
    keywords: C_KEYWORDS,
    literals: C_LITERALS,
    types: C_TYPES,
    preprocessor: true,
  },
  cpp: {
    ...BASE,
    keywords: new Set([
      ...C_KEYWORDS,
      ...WORDS(
        "alignas alignof and catch class constexpr consteval decltype delete dynamic_cast explicit export final friend mutable namespace new noexcept not operator or override private protected public reinterpret_cast static_assert static_cast template this throw try typeid typename using virtual",
      ),
    ]),
    literals: C_LITERALS,
    types: C_TYPES,
    preprocessor: true,
  },
  java: {
    ...BASE,
    blocks: [COMMENT_BLOCK, TEXT_BLOCK],
    keywords: JAVA_KEYWORDS,
    literals: WORDS("true false null"),
    types: JAVA_TYPES,
    annotations: true,
  },
  kotlin: {
    ...BASE,
    blocks: [COMMENT_BLOCK, TEXT_BLOCK],
    keywords: WORDS(
      "as break by catch class companion continue data do else enum finally for fun if import in init inline interface is lateinit object open override package private protected public return sealed super suspend this throw try typealias val var when where while",
    ),
    literals: WORDS("true false null"),
    types: WORDS("Int Long Double Float Boolean String Unit Any Nothing List Map Set"),
    annotations: true,
  },
  csharp: {
    ...BASE,
    keywords: WORDS(
      "abstract as async await base break case catch checked class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using var virtual volatile while yield",
    ),
    literals: WORDS("true false null"),
    types: WORDS(
      "bool byte char decimal double float int long object sbyte short string uint ulong ushort void dynamic",
    ),
    preprocessor: true,
  },
  python: {
    ...BASE,
    line: ["#"],
    blocks: [
      { start: '"""', end: '"""', kind: "string", escape: true },
      { start: "'''", end: "'''", kind: "string", escape: true },
    ],
    keywords: WORDS(
      "and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case",
    ),
    literals: WORDS("True False None"),
    types: WORDS("int str float bool list dict set tuple bytes object type self cls"),
    annotations: true,
  },
  lua: {
    ...BASE,
    line: ["--"],
    blocks: [
      { start: "--[[", end: "]]", kind: "comment", escape: false },
      { start: "[[", end: "]]", kind: "string", escape: false },
    ],
    keywords: WORDS(
      "and break do else elseif end for function goto if in local not or repeat return then until while",
    ),
    literals: WORDS("true false nil"),
    types: WORDS("self"),
    capitalTypes: false,
  },
  go: {
    ...BASE,
    blocks: [COMMENT_BLOCK, { start: "`", end: "`", kind: "string", escape: false }],
    keywords: WORDS(
      "break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var",
    ),
    literals: WORDS("true false nil iota"),
    types: WORDS(
      "bool byte error float32 float64 int int8 int16 int32 int64 rune string uint uint8 uint16 uint32 uint64 uintptr any",
    ),
  },
  rust: {
    ...BASE,
    quotes: '"',
    keywords: WORDS(
      "as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return self static struct super trait type unsafe use where while",
    ),
    literals: WORDS("true false None Some Ok Err"),
    types: WORDS(
      "bool char f32 f64 i8 i16 i32 i64 i128 isize str u8 u16 u32 u64 u128 usize String Vec Option Result Box Self",
    ),
  },
  php: {
    ...BASE,
    line: ["//", "#"],
    keywords: WORDS(
      "abstract and array as break case catch class clone const continue declare default do echo else elseif empty extends final finally fn for foreach function global if implements include include_once instanceof interface isset list namespace new or print private protected public require require_once return static switch throw trait try unset use var while yield",
    ),
    literals: WORDS("true false null TRUE FALSE NULL"),
    types: WORDS("int float string bool array object mixed void self"),
  },
  shell: {
    ...BASE,
    line: ["#"],
    blocks: [],
    keywords: WORDS(
      "if then elif else fi for while until do done case esac in function select return exit break continue local export readonly declare source alias unset shift",
    ),
    literals: WORDS("true false"),
    calls: false,
    capitalTypes: false,
  },
  sql: {
    ...BASE,
    line: ["--"],
    quotes: `'"`,
    keywords: WORDS(
      "select from where and or not in is null like between join left right inner outer full cross on as group by order having limit offset union all distinct insert into values update set delete create table alter drop index view database primary key foreign references default unique constraint if exists case when then else end asc desc count sum avg min max",
    ),
    literals: WORDS("true false null"),
    types: WORDS("int integer bigint smallint varchar char text boolean date datetime timestamp float double decimal serial"),
    ignoreCase: true,
    capitalTypes: false,
  },
  css: {
    ...BASE,
    line: [],
    literals: WORDS("inherit initial unset none auto transparent currentcolor"),
    annotations: true,
    capitalTypes: false,
    hyphenWords: true,
    keys: true,
    hexColors: true,
  },
};

