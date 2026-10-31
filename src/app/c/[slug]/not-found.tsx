import { RETENTION_DAYS } from "@/lib/config";

export default function BrandNotFound() {
  return (
    <main className="not-found">
      <section className="hero hero--center grid-container">
        <div className="hero__head settle">
          <h1 className="hero__title">Log not found</h1>
          <p className="hero__lead">
            Check the link for typos. Logs are also deleted after {RETENTION_DAYS} days.
          </p>
        </div>
      </section>
    </main>
  );
}
