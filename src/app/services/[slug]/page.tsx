import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES_CONTENT } from "@/content/services";
import { ServiceBody } from "@/components/sections/ServiceBody";

export function generateStaticParams() {
  return Object.keys(SERVICES_CONTENT).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES_CONTENT[slug];
  if (!service) return {};
  return {
    title: `${service.title} | Axieonex`,
    description: service.metaDescription,
    alternates: { canonical: `/services/${slug}` },
  };
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES_CONTENT[slug];
  if (!service) notFound();
  return <ServiceBody service={service} />;
}
