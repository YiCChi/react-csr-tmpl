import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { NotFound } from './pages/not-found.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index lazy={async () => import('./pages/welcome.tsx')} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/sub/*" lazy={async () => import('./pages/sub/sub.tsx')} />
    </>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export { App };
