import { Outlet, Link } from 'react-router';
import { CounterContextProvider } from '../context/counter-context.tsx';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../utils/trpc.ts';

function Root() {
  console.log('this is backend uri', import.meta.env.PUBLIC_API_URL);

  return (
    <QueryClientProvider client={queryClient}>
      <CounterContextProvider>
        <div>
          <header style={{ padding: '1rem', borderBottom: '1px solid #eee', marginBottom: '2rem' }}>
            <h1>Pure React + tRPC Demo</h1>
            <nav style={{ marginTop: '1rem' }}>
              <Link
                to="/"
                style={{ marginRight: '1rem', color: '#0066cc', textDecoration: 'none' }}
              >
                Home
              </Link>
              <Link
                to="/users"
                style={{ marginRight: '1rem', color: '#0066cc', textDecoration: 'none' }}
              >
                User Management
              </Link>
              <Link
                to="/posts"
                style={{ marginRight: '1rem', color: '#0066cc', textDecoration: 'none' }}
              >
                Post Management
              </Link>
              <Link
                to="/sub/dashboard"
                style={{ marginRight: '1rem', color: '#0066cc', textDecoration: 'none' }}
              >
                Sub Dashboard
              </Link>
            </nav>
          </header>
          <main style={{ padding: '0 1rem' }}>
            <Outlet />
          </main>
        </div>
      </CounterContextProvider>
    </QueryClientProvider>
  );
}

export { Root };
