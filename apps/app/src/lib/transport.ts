import type { Interceptor } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { tokenGetter } from "./auth-token";

// Attaches the Clerk bearer token (when signed in) to every RPC.
const auth: Interceptor = (next) => async (req) => {
  const token = await tokenGetter.current?.();
  if (token) {
    req.header.set("Authorization", `Bearer ${token}`);
  }
  return next(req);
};

export const transport = createConnectTransport({
  baseUrl: import.meta.env.VITE_API_URL ?? "http://localhost:3001",
  interceptors: [auth],
});
