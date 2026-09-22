import "server-only";

import { requireAdmin } from "@/lib/adminAuthorization";
import { prisma } from "@/lib/prisma";

export async function getAdminSubmissions() {
  await requireAdmin();
  return Promise.all([
    prisma.contactSubmission.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.bookingRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
}

export async function getAdminArticles() {
  await requireAdmin();
  return prisma.article.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getAdminArticle(id: string) {
  await requireAdmin();
  return prisma.article.findUnique({ where: { id } });
}
