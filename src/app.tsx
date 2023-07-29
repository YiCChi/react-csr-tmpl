import { cloneDeep } from 'lodash';
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from 'react-router-dom';
import { Component } from './pages/root';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Component />}>
      <Route path="/not-found" lazy={async () => import('./pages/not-found')} />
      <Route index={true} path="/welcome" lazy={async () => import('./pages/welcome')} />
    </Route>,
  ),
);

function App() {
  const a = { foo: 1 };
  const b = cloneDeep(a);

  console.log(b);

  return <RouterProvider router={router} />;
}

export { App };
