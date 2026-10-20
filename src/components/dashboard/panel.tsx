import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="dash-page">
      <div className="dash-page__text">
        <h1 className="dash-page__title">{title}</h1>
        {description && <p className="dash-page__lead">{description}</p>}
      </div>
      {actions && <div className="dash-page__actions">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  description,
  action,
  flush = false,
  tone = "default",
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  flush?: boolean;
  tone?: "default" | "danger";
  children: ReactNode;
}) {
  return (
    <section className={tone === "danger" ? "dash-panel dash-panel--danger" : "dash-panel"}>
      <header className="dash-panel__head">
        <div>
          <h2 className="dash-panel__title">{title}</h2>
          {description && <p className="dash-panel__lead">{description}</p>}
        </div>
        {action}
      </header>
      <div className={flush ? "dash-panel__body dash-panel__body--flush" : "dash-panel__body"}>
        {children}
      </div>
    </section>
  );
}

export function Figures({ children }: { children: ReactNode }) {
  return <dl className="dash-figures">{children}</dl>;
}

export function Figure({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="dash-figure">
      <dt className="dash-figure__label">{label}</dt>
      <dd className="dash-figure__value">{value}</dd>
      {note && <dd className="dash-figure__note">{note}</dd>}
    </div>
  );
}

export function EmptyState({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="dash-empty">
      <p className="dash-empty__title">{title}</p>
      <p className="dash-empty__text">{children}</p>
      {action}
    </div>
  );
}

export function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="dash-detail">
      <dt className="dash-detail__label">{label}</dt>
      <dd className="dash-detail__value">{children}</dd>
    </div>
  );
}

export function Notice({ children }: { children: ReactNode }) {
  return (
    <p className="dash-notice" role="alert">
      {children}
    </p>
  );
}
