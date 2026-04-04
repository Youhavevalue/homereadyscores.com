import { useLocation } from 'react-router-dom';

/** Base path for team UI: `/admin` or legacy `/portal`. */
export function usePortalBase() {
  const { pathname } = useLocation();
  return pathname.startsWith('/admin') ? '/admin' : '/portal';
}
