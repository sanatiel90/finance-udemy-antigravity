import { prisma } from "./prisma";

export const DEFAULT_USER = {
  id: process.env.DEFAULT_USER_ID || "00000000-0000-0000-0000-000000000001",
  email: process.env.DEFAULT_USER_EMAIL || "demo@antigravity.finance",
  name: process.env.DEFAULT_USER_NAME || "Alex Morgan",
};

/**
 * Returns the current authenticated user ID.
 * Multi-user ready: In production, extract user id from session/JWT.
 * For MVP/single-user mode, ensures the default demo user exists and returns its ID.
 */
export async function getCurrentUserId(request?: Request): Promise<string> {
  // Allow passing custom x-user-id header for testing/multi-user support
  if (request) {
    const customUserId = request.headers.get("x-user-id");
    if (customUserId) {
      return customUserId;
    }
  }

  // Ensure default demo user exists
  await prisma.user.upsert({
    where: { id: DEFAULT_USER.id },
    update: {},
    create: {
      id: DEFAULT_USER.id,
      email: DEFAULT_USER.email,
      name: DEFAULT_USER.name,
    },
  });

  return DEFAULT_USER.id;
}
