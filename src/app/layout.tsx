import type { Metadata } from "next";
import localFont from "next/font/local";
import { TooltipHost } from "@/components/tooltip-host";
import { RETENTION_DAYS } from "@/lib/config";
import { SITE_NAME } from "@/lib/seo";
import { pageBase } from "@/lib/site";
import "./globals.scss";

const geist = localFont({
  src: "../../node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
  variable: "--font-geist",
  weight: "100 900",
  display: "swap",
});

const bricolage = localFont({
  src: "../../node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  variable: "--font-bricolage",
  weight: "200 800",
  display: "swap",
});

const minecraft = localFont({
  src: "../../public/font/Minecraft.ttf",
  variable: "--font-minecraft",
  display: "swap",
});

const jetbrains = localFont({
  src: "../../node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  variable: "--font-jetbrains",
  weight: "100 800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(pageBase()),
  title: {
    default: "Share Minecraft logs and crash reports | minelog",
    template: "%s | minelog",
  },
  applicationName: SITE_NAME,
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US" },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  description:
    `Paste a Minecraft log or crash report and get a link you can share. Private details are hidden, and the link stops working after ${RETENTION_DAYS} days.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${bricolage.variable} ${jetbrains.variable} ${minecraft.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var s=localStorage.getItem("minelog:theme");var t=s==="light"||s==="dark"?s:(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <TooltipHost />
      </body>
    </html>
  );
}

