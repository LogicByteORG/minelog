import { Info } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { LogPageView } from "@/components/log-page-view";
import { buildDemoLog } from "@/lib/demo-log";
import { DEFAULT_FEATURES } from "@/lib/page-settings";
import { findPageBySlug } from "@/lib/log-pages";
import { getSession } from "@/lib/session";

// What the owner sees when they open their page: a sample log in their own look.
// Every feature is rendered and the page hides the switched-off ones by style (`data-off`),
// so the editor can toggle them live. Nobody else gets to see it, the page looks like it does not exist.
export default async function CustomPageDemo({ params }: PageProps<"/c/[slug]">) {
  const { slug } = await params;
  const page = await findPageBySlug(slug);
  const session = await getSession();
  if (!page || session?.user.id !== page.userId) notFound();

  return (
    <>
      <LogPageView log={buildDemoLog()} features={DEFAULT_FEATURES} />
      <p className="brand-demo">
        <Info weight="bold" aria-hidden="true" />
        Demo log, only you can see it. Logs your app saves with this page&apos;s API key look like
        this.
      </p>
    </>
  );
}
