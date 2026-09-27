"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import { Check, Copy } from "@phosphor-icons/react";
import { copyText } from "@/lib/copy";
import { ReadmeImage } from "./readme-image";

const CODE_LANGUAGES = [
  "text",
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "sh",
  "bash",
  "shell",
  "console",
  "py",
  "rb",
  "java",
  "c",
  "h",
  "cpp",
  "hpp",
  "cs",
  "go",
  "rs",
  "php",
  "swift",
  "kt",
  "scala",
  "html",
  "xml",
  "css",
  "scss",
  "sql",
  "yaml",
  "yml",
  "toml",
  "ini",
  "properties",
  "md",
  "markdown",
  "diff",
  "dockerfile",
  "graphql",
  "lua",
  "ps1",
  "bat",
].map((name) => `language-${name}`);

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), ["className", ...CODE_LANGUAGES]],
  },
};

function flattenText(node: ReactNode): string {
  return Children.toArray(node)
    .map((child) => {
      if (typeof child === "string" || typeof child === "number") {
        return String(child);
      }
      if (isValidElement<{ children?: ReactNode }>(child)) {
        return flattenText(child.props.children);
      }
      return "";
    })
    .join("");
}

function slugOf(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-");
  return slug || "section";
}

function Heading({ level, children }: { level: 1 | 2 | 3 | 4 | 5 | 6; children: ReactNode }) {
  const slug = slugOf(flattenText(children));
  const Tag = `h${level}` as const;
  return (
    <Tag id={slug} className="readme__heading">
      <a href={`#${slug}`} aria-label="Link to this heading" className="readme__anchor">
        #
      </a>
      {children}
    </Tag>
  );
}

function ReadmeLink({ href, children }: { href?: string; children: ReactNode }) {
  const external = /^https?:\/\//i.test(href ?? "");
  if (!external) return <a href={href}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

function CodeBlock({ language, code, children }: { language: string | null; code: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  async function onCopy() {
    if (await copyText(code)) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }
  return (
    <figure className="readme__code">
      <div className="readme__codebar">
        <span>{language ?? "Code"}</span>
        <button
          type="button"
          className="readme__copy"
          onClick={() => void onCopy()}
          aria-label={copied ? "Copied" : "Copy code"}
          data-tip={copied ? "Copied" : "Copy code"}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
      </div>
      <pre>{children}</pre>
    </figure>
  );
}

const CALLOUT_MARK = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i;

function splitCallout(children: ReactNode): { type: string | null; body: ReactNode } {
  const match = CALLOUT_MARK.exec(flattenText(children));
  if (!match) return { type: null, body: children };
  const type = match[1].toLowerCase();
  let drop = match[0].length;
  const cut = (node: ReactNode): ReactNode => {
    if (drop <= 0) return node;
    if (typeof node === "string" || typeof node === "number") {
      const text = String(node);
      if (text.length <= drop) {
        drop -= text.length;
        return "";
      }
      const rest = text.slice(drop);
      drop = 0;
      return rest;
    }
    if (isValidElement<{ children?: ReactNode }>(node)) {
      return cloneElement(
        node as ReactElement<{ children?: ReactNode }>,
        { children: Children.map(node.props.children, cut) } as never,
      );
    }
    return node;
  };
  return { type, body: Children.map(children, cut) };
}

const components: Components = {
  h1: ({ children }) => <Heading level={1}>{children}</Heading>,
  h2: ({ children }) => <Heading level={2}>{children}</Heading>,
  h3: ({ children }) => <Heading level={3}>{children}</Heading>,
  h4: ({ children }) => <Heading level={4}>{children}</Heading>,
  h5: ({ children }) => <Heading level={5}>{children}</Heading>,
  h6: ({ children }) => <Heading level={6}>{children}</Heading>,
  a: ({ href, children }) => <ReadmeLink href={href}>{children}</ReadmeLink>,
  img: ({ src, alt, title }) => (
    <ReadmeImage
      key={typeof src === "string" ? src : ""}
      src={typeof src === "string" ? src : undefined}
      alt={alt}
      title={title}
    />
  ),
  table: ({ children }) => (
    <div className="readme__tablewrap">
      <table>{children}</table>
    </div>
  ),
  pre: ({ children }) => {
    const first = Children.toArray(children)[0];
    let language: string | null = null;
    let code = "";
    if (isValidElement<{ className?: string; children?: ReactNode }>(first)) {
      const found = /language-([\w+-]+)/.exec(first.props.className ?? "");
      language = found?.[1] ?? null;
      code = flattenText(first.props.children);
    } else {
      code = flattenText(children);
    }
    return (
      <CodeBlock language={language} code={code}>
        {children}
      </CodeBlock>
    );
  },
  blockquote: ({ children }) => {
    const { type, body } = splitCallout(children);
    if (!type) return <blockquote>{children}</blockquote>;
    return (
      <div role="note" className={`readme__callout readme__callout--${type}`}>
        {body}
      </div>
    );
  },
};

type HighlightApi = { set(name: string, value: unknown): void; delete(name: string): void };
type HighlightCtor = new (...ranges: Range[]) => unknown;

function highlightRegistry(): { api: HighlightApi; Highlight: HighlightCtor } | null {
  const api = (CSS as unknown as { highlights?: HighlightApi }).highlights;
  const Highlight = (window as unknown as { Highlight?: HighlightCtor }).Highlight;
  return api && Highlight ? { api, Highlight } : null;
}

const SKIP = ".readme__anchor";

function collectRanges(root: HTMLElement, pattern: RegExp): Range[] {
  const ranges: Range[] = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) =>
      node.parentElement?.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
  });
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const text = node.nodeValue ?? "";
    pattern.lastIndex = 0;
    for (let found = pattern.exec(text); found; found = pattern.exec(text)) {
      if (found[0] === "") {
        pattern.lastIndex += 1;
        continue;
      }
      const range = document.createRange();
      range.setStart(node, found.index);
      range.setEnd(node, found.index + found[0].length);
      ranges.push(range);
    }
  }
  return ranges;
}

export type ReadmeFind = {
  pattern: RegExp | null;
  index: number | null;
  onCount: (count: number) => void;
};

export function ReadmeView({
  text,
  label,
  find,
}: {
  text: string;
  label: string;
  find?: ReadmeFind;
}) {
  const root = useRef<HTMLDivElement>(null);
  const ranges = useRef<Range[]>([]);
  const [count, setCount] = useState(0);
  const pattern = find?.pattern ?? null;
  const onCount = find?.onCount;
  const index = find?.index ?? null;

  useEffect(() => {
    const registry = highlightRegistry();
    const found = root.current && pattern ? collectRanges(root.current, pattern) : [];
    ranges.current = found;
    setCount(found.length);
    onCount?.(found.length);
    if (registry) {
      if (found.length > 0) {
        registry.api.set("readme-find", new registry.Highlight(...found));
      } else {
        registry.api.delete("readme-find");
      }
    }
    return () => registry?.api.delete("readme-find");
  }, [text, pattern, onCount]);

  useEffect(() => {
    const registry = highlightRegistry();
    const range = index === null ? undefined : ranges.current[index];
    if (!range) {
      registry?.api.delete("readme-find-current");
      return;
    }
    registry?.api.set("readme-find-current", new registry.Highlight(range));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rect = range.getBoundingClientRect();
    window.scrollTo({
      top: Math.max(0, rect.top + window.scrollY - window.innerHeight / 2),
      behavior: reduce ? "auto" : "smooth",
    });
    return () => registry?.api.delete("readme-find-current");
  }, [index, count]);

  return (
    <div ref={root} role="region" aria-label={label} tabIndex={0} className="readme scroll-quiet">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        components={components}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

