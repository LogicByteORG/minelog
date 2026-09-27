"use client";

type Option<T extends string | number> = {
  value: T;
  label: string;
};

type SegmentedProps<T extends string | number> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className="segmented">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="segmented__option"
          aria-pressed={option.value === value}
          disabled={disabled}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

