// Holds the current Clerk token getter so the Connect transport interceptor can attach a
// bearer token without the transport depending on React or Clerk. ClerkTokenBridge sets it
// when Clerk is configured; it stays null otherwise, so public RPCs still work.
export const tokenGetter: {
  current: (() => Promise<string | null>) | null;
} = { current: null };
