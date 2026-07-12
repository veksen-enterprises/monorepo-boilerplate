import { useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { tokenGetter } from "./auth-token";

// Bridges Clerk's getToken into the transport interceptor. Renders nothing; only mounted
// inside ClerkProvider (when a publishable key is configured).
export function ClerkTokenBridge() {
  const { getToken } = useAuth();
  useEffect(() => {
    tokenGetter.current = () => getToken();
    return () => {
      tokenGetter.current = null;
    };
  }, [getToken]);
  return null;
}
