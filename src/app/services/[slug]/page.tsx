import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServiceDetailTemplate } from "@/components/services/ServiceDetailTemplate";
import { SERVICES, getService } from "@/content/services";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return SERVICES.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  const canonical = `${SITE_URL}/services/${slug}`;
  const title = `${service.title} | AXIEONEX`;
  return {
    title,
    description: service.purpose,
    alternates: { canonical },
    openGraph: { title, description: service.purpose, url: canonical },
  };
}

export default async function ServiceDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return <ServiceDetailTemplate service={service} />;
}
