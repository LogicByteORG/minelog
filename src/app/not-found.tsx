import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RETENTION_DAYS } from "@/lib/config";

export default function NotFound() {
  return (
    <>
      <SiteHeader />

      <main className="not-found">
        <section className="hero hero--center grid-container">
          <div className="hero__head settle">
            <h1 className="hero__title">Log not found</h1>
            <p className="hero__lead">
              Check the link for typos. Logs are also deleted after {RETENTION_DAYS} days.
            </p>
          </div>
          <Link href="/" className="button settle settle--late">
            Share a log
          </Link>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
