import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { renderHead } from '../../shared/public-pages';
export default function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Build-time HTML serves crawlers; this keeps internal SPA navigation in sync.
    const fragment = document.createElement('template');
    fragment.innerHTML = renderHead(pathname);
    document.head.querySelectorAll('title,meta[name="description"],meta[name="robots"],meta[property^="og:"],meta[name^="twitter:"],link[rel="canonical"],script[type="application/ld+json"]').forEach(node => node.remove());
    document.head.append(fragment.content);
  }, [pathname]);
  return null;
}
