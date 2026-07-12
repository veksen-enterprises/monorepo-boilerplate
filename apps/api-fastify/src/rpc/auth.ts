import { verifyToken } from "@clerk/backend";
import type { HandlerContext } from "@connectrpc/connect";

// Verify the Clerk session JWT from the Authorization header and return the user id,
// or null when there is no valid token. Clerk is an unmanaged dependency — in tests
// `@clerk/backend` is mocked at the module boundary (see notes.routes.test.ts).
export async function userIdFromContext(
  ctx: HandlerContext,
): Promise<string | null> {
  const header = ctx.requestHeader.get("authorization");
  const token = header?.replace(/^Bearer\s+/i, "");
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!token || !secretKey) {
    return null;
  }
  try {
    const claims = await verifyToken(token, { secretKey });
    return claims.sub;
  } catch {
    return null;
  }
}
