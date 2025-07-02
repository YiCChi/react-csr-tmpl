import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import { NotFound } from './pages/not-found.tsx';
import { Root } from './pages/root.tsx';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route
        index
        lazy={async () => {
          const module = await import('./pages/welcome.tsx');
          return { Component: module.Component };
        }}
      />
      <Route
        path="/users"
        lazy={async () => {
          const module = await import('./pages/user-management.tsx');
          return { Component: module.default };
        }}
      />
      <Route
        path="/posts"
        lazy={async () => {
          const module = await import('./pages/post-management.tsx');
          return { Component: module.default };
        }}
      />
      <Route path="/not-found" element={<NotFound />} />
      <Route
        path="/sub/*"
        lazy={async () => {
          const module = await import('./pages/sub/sub.tsx');
          return { Component: module.Component };
        }}
      />
    </Route>,
  ),
);

function App() {
  return <RouterProvider router={router} />;
}

export { App };
