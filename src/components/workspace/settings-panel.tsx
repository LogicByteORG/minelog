"use client";

import { useId } from "react";
import type { LogFont, Spacing, TextSize, ViewSettings } from "@/lib/use-view-settings";
import { FONT_OPTIONS } from "@/lib/use-view-settings";
import type { LogKind } from "@/lib/log";
import { Segmented } from "./segmented";

type SettingsPanelProps = {
  id: string;
  kind: LogKind;
  settings: ViewSettings;
  onChange: (patch: Partial<ViewSettings>) => void;
  onReset: () => void;
};

export function SettingsPanel({
  id,
  kind,
  settings,
  onChange,
  onReset,
}: SettingsPanelProps) {
  const fontId = useId();
  const showChat = kind === "server" || kind === "client" || kind === "unknown";

  return (
    <aside id={id} className="settings" aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className="settings__title">
        Settings
      </h2>

      <div className="settings__list">
        <section aria-label="Content">
          <h3 className="settings__group">Content</h3>
          {showChat && (
            <SettingSwitch
              label="Hide player chat"
              hint="Hide chat messages from players. Join and leave lines stay."
              checked={settings.hideChat}
              onChange={(hideChat) => onChange({ hideChat })}
            />
          )}
          <SettingSwitch
            label="Hide empty lines"
            hint="Skip blank lines to fit more on screen."
            checked={settings.hideEmpty}
            onChange={(hideEmpty) => onChange({ hideEmpty })}
          />
          <SettingSwitch
            label="Show marked only"
            hint="Show only lines you marked with their number."
            checked={settings.markedOnly}
            onChange={(markedOnly) => onChange({ markedOnly })}
          />
          <SettingSwitch
            label="Clickable links"
            hint="Turn web addresses into links you can open."
            checked={settings.linkify}
            onChange={(linkify) => onChange({ linkify })}
          />
        </section>

        <section aria-label="Text">
          <h3 className="settings__group">Text</h3>
          <div className="setting setting--stacked">
            <div className="setting__text">
              <label htmlFor={fontId} className="setting__label">
                Font
              </label>
              <p id={`${fontId}-hint`} className="setting__hint">
                Pick the typeface for log lines.
              </p>
            </div>
            <select
              id={fontId}
              className="setting__select"
              aria-describedby={`${fontId}-hint`}
              value={settings.fontFamily}
              onChange={(event) =>
                onChange({ fontFamily: event.target.value as LogFont })
              }
            >
              {FONT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting setting--stacked">
            <span className="setting__label">Text size</span>
            <Segmented<TextSize>
              label="Text size"
              options={[
                { value: "small", label: "Small" },
                { value: "medium", label: "Medium" },
                { value: "large", label: "Large" },
              ]}
              value={settings.textSize}
              onChange={(textSize) => onChange({ textSize })}
            />
          </div>

          <div className="setting setting--stacked">
            <span className="setting__label">Row spacing</span>
            <Segmented<Spacing>
              label="Row spacing"
              options={[
                { value: "compact", label: "Compact" },
                { value: "comfortable", label: "Comfortable" },
              ]}
              value={settings.spacing}
              onChange={(spacing) => onChange({ spacing })}
            />
          </div>
        </section>

        <section aria-label="Lines">
          <h3 className="settings__group">Lines</h3>
          <SettingSwitch
            label="Wrap long lines"
            hint="Break long lines instead of scrolling sideways."
            checked={settings.wrap}
            onChange={(wrap) => onChange({ wrap })}
          />
          <SettingSwitch
            label="Line numbers"
            hint="Show the line number next to each line."
            checked={settings.lineNumbers}
            onChange={(lineNumbers) => onChange({ lineNumbers })}
          />
          <SettingSwitch
            label="Timestamps"
            hint="Show the time at the start of each line."
            checked={settings.timestamps}
            onChange={(timestamps) => onChange({ timestamps })}
          />
          <SettingSwitch
            label="Color by level"
            hint="Tint warnings and errors."
            checked={settings.colorLevels}
            onChange={(colorLevels) => onChange({ colorLevels })}
          />
          <SettingSwitch
            label="Fold stack traces"
            hint="Collapse long stack traces into one line."
            checked={settings.foldStacks}
            onChange={(foldStacks) => onChange({ foldStacks })}
          />
        </section>
      </div>

      <button type="button" className="button hollow button--sm" onClick={onReset}>
        Reset settings
      </button>
    </aside>
  );
}

function SettingSwitch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();

  return (
    <div className="setting">
      <div className="setting__text">
        <label htmlFor={id} className="setting__label">
          {label}
        </label>
        <p id={`${id}-hint`} className="setting__hint">
          {hint}
        </p>
      </div>
      <div className="switch">
        <input
          id={id}
          className="switch-input"
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-describedby={`${id}-hint`}
        />
        <label className="switch-paddle" htmlFor={id}>
          <span className="show-for-sr">{label}</span>
        </label>
      </div>
    </div>
  );
}
