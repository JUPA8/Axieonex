import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const UNAUTHORIZED_MESSAGE = "Not authorized.";

/**
 * Revalidates the signed Auth.js session against the current Admin row.
 * Sensitive callers must invoke this immediately before accessing data so a
 * deleted or disabled admin cannot keep using an older, otherwise-valid JWT.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  let adminId: string | undefined;
  try {
    const session = await auth();
    adminId = session?.user?.id;
  } catch {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }

  if (!adminId) throw new Error(UNAUTHORIZED_MESSAGE);

  try {
    const admin = await prisma.admin.findFirst({
      where: { id: adminId, active: true },
      select: { id: true, email: true },
    });
    if (!admin) throw new Error(UNAUTHORIZED_MESSAGE);
    return admin;
  } catch {
    throw new Error(UNAUTHORIZED_MESSAGE);
  }
}
