import type { ReactNode } from "react";

export function Toggle({
  id,
  label,
  checked,
  disabled = false,
  describedBy,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  disabled?: boolean;
  describedBy?: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="switch">
      <input
        id={id}
        className="switch-input"
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        aria-describedby={describedBy}
      />
      <label className="switch-paddle" htmlFor={id}>
        <span className="show-for-sr">{label}</span>
      </label>
    </div>
  );
}

export function SwitchRow({
  id,
  icon,
  title,
  hint,
  checked,
  onChange,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  hint: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="privacy-toggle__row">
      <div className="privacy-toggle__text">
        <label htmlFor={id} className="privacy-toggle__title">
          {icon}
          {title}
        </label>
        <p id={`${id}-hint`} className="privacy-toggle__hint">
          {hint}
        </p>
      </div>
      <Toggle
        id={id}
        label={title}
        checked={checked}
        describedBy={`${id}-hint`}
        onChange={onChange}
      />
    </div>
  );
}
