import { Layout } from '@site/site/Layout';
import { useRouter, Link } from '@site/lib/router';
import { Home } from '@site/pages/Home';
import { GettingStarted } from '@site/pages/GettingStarted';
import { Architecture } from '@site/pages/Architecture';
import { Theming } from '@site/pages/Theming';
import { Showcase } from '@site/pages/Showcase';
import { ComponentsIndex } from '@site/pages/ComponentsIndex';
import { ComponentPage } from '@site/pages/ComponentPage';

const NotFound = ({ route }: { route: string }) => (
  <div className="py-16 text-center">
    <p className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">404</p>
    <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
    <p className="mt-3 text-muted-foreground">
      Nothing is routed at <code className="font-mono text-[13px]">{route}</code>.
    </p>
    <div className="mt-6 flex items-center justify-center gap-3">
      <Link
        to="/"
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
      >
        Go home
      </Link>
      <Link to="/components" className="px-4 py-2 rounded-lg border border-border text-sm">
        Browse components
      </Link>
    </div>
  </div>
);

export const App = () => {
  const { route } = useRouter();

  if (route === '/') {
    return (
      <Layout sidebar={false}>
        <Home />
      </Layout>
    );
  }

  const componentMatch = /^\/components\/(.+)$/.exec(route);

  const page = (() => {
    if (route === '/components') return <ComponentsIndex />;
    if (componentMatch) return <ComponentPage slug={componentMatch[1]} />;
    if (route === '/docs/getting-started') return <GettingStarted />;
    if (route === '/docs/architecture') return <Architecture />;
    if (route === '/docs/theming') return <Theming />;
    if (route === '/showcase') return <Showcase />;
    return <NotFound route={route} />;
  })();

  return <Layout>{page}</Layout>;
};
