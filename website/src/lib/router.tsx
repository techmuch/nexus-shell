import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

declare const __SITE_BASE__: string;

/**
 * A minimal History-API router.
 *
 * The site deliberately ships no routing dependency — it needs to match a path
 * against a table and re-render, which is a few dozen lines. Deep links work in
 * production because the build copies `index.html` to `404.html`, and GitHub
 * Pages serves that for any unmatched path.
 */

const BASE = __SITE_BASE__.replace(/\/$/, '');

/** Strip the deploy base prefix so routes can be written as plain paths. */
const toRoute = (pathname: string): string => {
  const stripped = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  const normalized = stripped.replace(/\/+$/, '');
  return normalized === '' ? '/' : normalized;
};

/** Prefix a route with the deploy base for use in `href` and `pushState`. */
export const href = (route: string): string => `${BASE}${route === '/' ? '/' : route}`;

interface RouterValue {
  route: string;
  navigate: (route: string) => void;
}

const RouterContext = createContext<RouterValue>({
  route: '/',
  navigate: () => {},
});

export const RouterProvider = ({ children }: { children: ReactNode }) => {
  const [route, setRoute] = useState(() => toRoute(window.location.pathname));

  useEffect(() => {
    const onPop = () => setRoute(toRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = useCallback((next: string) => {
    if (toRoute(window.location.pathname) === next) return;
    window.history.pushState({}, '', href(next));
    setRoute(next);
    window.scrollTo({ top: 0 });
  }, []);

  const value = useMemo(() => ({ route, navigate }), [route, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
};

export const useRouter = () => useContext(RouterContext);

export interface LinkProps {
  to: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * An internal link. Renders a real `<a href>` so middle-click, cmd-click and
 * crawlers all behave, but intercepts plain left-clicks for client navigation.
 */
export const Link = ({ to, children, className, onClick }: LinkProps) => {
  const { navigate } = useRouter();

  return (
    <a
      href={href(to)}
      className={className}
      onClick={(e) => {
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
          return;
        }
        e.preventDefault();
        onClick?.();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
};
