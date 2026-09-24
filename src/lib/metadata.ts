import type { Metadata } from "next";

export function buildPublicMetadata({
  title,
  description,
  canonical,
  type = "website",
}: {
  title: string;
  description: string;
  canonical: string;
  type?: "website" | "article";
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type },
    twitter: { card: "summary", title, description },
  };
}
