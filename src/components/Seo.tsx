import { Helmet } from "react-helmet-async";

interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const SITE_URL = "https://evem.ro";

/**
 * Centralised SEO head: title, description, self-referencing canonical,
 * Open Graph + Twitter, and optional JSON-LD structured data.
 */
export const Seo = ({
  title,
  description,
  canonical,
  image,
  type = "website",
  noindex,
  jsonLd,
}: SeoProps) => {
  const path =
    canonical ??
    (typeof window !== "undefined" ? window.location.pathname : "/");
  const href = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const desc = description?.slice(0, 160);

  return (
    <Helmet>
      <title>{title}</title>
      {desc && <meta name="description" content={desc} />}
      <link rel="canonical" href={href} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      {desc && <meta property="og:description" content={desc} />}
      <meta property="og:url" content={href} />
      {image && <meta property="og:image" content={image} />}

      <meta name="twitter:card" content={image ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={title} />
      {desc && <meta name="twitter:description" content={desc} />}
      {image && <meta name="twitter:image" content={image} />}

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

export default Seo;
