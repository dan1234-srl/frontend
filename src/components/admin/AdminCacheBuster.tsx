import { useEffect } from "react";
import { bustContentCaches, isContentEndpoint } from "@/lib/invalidate";

/**
 * Montat o singură dată în AdminLayout.
 * Interceptează `window.fetch` cât timp adminul e activ; la orice
 * POST/PUT/PATCH/DELETE reușit (status 2xx) către un endpoint de conținut,
 * invalidează automat cache-urile publicului → următoarea vizită pe shop,
 * categorie sau produs va vedea date proaspete fără refresh manual.
 */
const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

const AdminCacheBuster = () => {
  useEffect(() => {
    const original = window.fetch;
    window.fetch = async (input, init) => {
      const response = await original(input, init);
      try {
        const method = (
          init?.method ||
          (typeof input !== "string" && !(input instanceof URL)
            ? (input as Request).method
            : "GET")
        ).toUpperCase();
        if (response.ok && MUTATING.has(method)) {
          const url =
            typeof input === "string"
              ? input
              : input instanceof URL
                ? input.toString()
                : (input as Request).url;
          if (isContentEndpoint(url)) {
            bustContentCaches();
          }
        }
      } catch {}
      return response;
    };
    return () => {
      window.fetch = original;
    };
  }, []);

  return null;
};

export default AdminCacheBuster;
