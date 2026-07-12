import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { TransportProvider } from "@connectrpc/connect-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import "@repo/ui/styles.css";
import "./index.css";
import { ClerkTokenBridge } from "./lib/clerk-token-bridge";
import { queryClient } from "./lib/query";
import { transport } from "./lib/transport";
import { routeTree } from "./routeTree.gen";

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Clerk is optional: without a publishable key the app still runs and public RPCs work.
// Signing in (and the protected DeleteNote RPC) light up once VITE_CLERK_PUBLISHABLE_KEY is set.
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

function Providers({ children }: { children: ReactNode }) {
  const tree = (
    <QueryClientProvider client={queryClient}>
      <TransportProvider transport={transport}>{children}</TransportProvider>
    </QueryClientProvider>
  );
  if (!clerkKey) return tree;
  return (
    <ClerkProvider publishableKey={clerkKey}>
      <ClerkTokenBridge />
      {tree}
    </ClerkProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </StrictMode>,
);
