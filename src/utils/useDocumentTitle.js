import { useEffect } from "react";

/**
 * Custom React hook to dynamically update document title for SPA SEO crawlers.
 */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | RoadSathi` : "RoadSathi — Safer routes, together";
  }, [title]);
}
