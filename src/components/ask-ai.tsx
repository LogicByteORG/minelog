"use client";

import type { ComponentProps } from "react";
import { createPortal } from "react-dom";
import { CaretDown, OpenAiLogo, Sparkle } from "@phosphor-icons/react";
import { useFloatingMenu } from "@/lib/use-floating-menu";

function ClaudeIcon(props: ComponentProps<"span">) {
  return <span aria-hidden="true" {...props} className="ask-ai__icon" />;
}

const TARGETS = [
  {
    name: "Claude",
    base: "https://claude.ai/new?q=",
    Icon: ClaudeIcon,
  },
  {
    name: "ChatGPT",
    base: "https://chatgpt.com/?q=",
    Icon: OpenAiLogo,
  },
] as const;

export function AskAiMenu({ excerpt }: { excerpt: string }) {
  const { open, pos, button, menu, toggle, close } =
    useFloatingMenu<HTMLUListElement>();

  if (!excerpt) return null;

  const question =
    "My Minecraft log has these errors. What is causing them and how do I fix them?\n\n" +
    excerpt;

  return (
    <div className="ask-ai">
      <button
        type="button"
        ref={button}
        className="button hollow button--sm"
        aria-haspopup="menu"
        aria-expanded={open}
        data-tip="Ask an AI about these errors"
        onClick={toggle}
      >
        <Sparkle aria-hidden="true" />
        Ask AI
        <CaretDown aria-hidden="true" />
      </button>
      {open &&
        createPortal(
          <ul
            role="menu"
            aria-label="Ask an AI"
            ref={menu}
            className="ask-ai__menu ask-ai__menu--floating"
            style={{ top: pos.top, right: pos.right }}
          >
            {TARGETS.map(({ name, base, Icon }) => (
              <li key={name} role="none">
                <a
                  role="menuitem"
                  href={`${base}${encodeURIComponent(question)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                >
                  <Icon aria-hidden="true" />
                  {name}
                </a>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}

