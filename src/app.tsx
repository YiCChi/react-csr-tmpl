import { cloneDeep } from 'lodash';
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from 'react-router';
import { NotFound } from './pages/not-found';

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route index lazy={async () => import('./pages/welcome')} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/sub/*" lazy={async () => import('./pages/sub/sub')} />
    </>,
  ),
);

function App() {
  const a = { foo: 1 };
  const b = cloneDeep(a);

  console.log(b);

  return <RouterProvider router={router} />;
}

export { App };
