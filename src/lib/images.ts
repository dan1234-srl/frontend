/**
 * Optimizează URL-ul unei imagini folosind proxy-ul images.weserv.nl
 * @param originalUrl - URL-ul brut din S3 sau altă sursă
 * @param width - Lățimea dorită
 * @param height - Înălțimea dorită
 * @returns URL-ul optimizat WebP
 */
export const optimizeImageUrl = (
  originalUrl: string | null | undefined,
  width: number,
  height: number,
): string => {
  if (!originalUrl) return "/placeholder.svg";

  // Dacă este deja un string care nu este URL (ex: data-uri sau path local)
  if (originalUrl.startsWith("/") || originalUrl.startsWith("data:")) {
    return originalUrl;
  }

  // Curățăm URL-ul
  const cleanUrl = originalUrl.trim();

  // Construim URL-ul weserv
  // fit=cover: taie imaginea să umple dimensiunile (ca object-cover)
  // output=webp: conversie automată pentru viteză
  // il: progressive loading
  // q=85: calitate optimă pentru web
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=${width}&h=${height}&fit=cover&output=webp&il&q=85`;
};
