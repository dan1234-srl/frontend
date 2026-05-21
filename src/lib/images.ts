/**
 * Shim pentru compat — vechi import `optimizeImageUrl` delegat la cf-image.
 */
import { cfImg } from "@/lib/cf-image";

export const optimizeImageUrl = (
  originalUrl: string | null | undefined,
  width: number,
  height: number,
): string => {
  if (!originalUrl) return "/placeholder.svg";
  return cfImg(originalUrl, { w: width, h: height, fit: "cover" });
};

export { cfImg };
