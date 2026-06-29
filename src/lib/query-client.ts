import { QueryClient } from "@tanstack/react-query";

// Single shared QueryClient — importat și de App, și de utilitarele de invalidare.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
