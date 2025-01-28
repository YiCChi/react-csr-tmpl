import { lazy } from 'react';
import { Route, Routes } from 'react-router';
import { Component as Root } from './root';

const DashBoard = lazy(async () => import('./dashboard'));
const Customer = lazy(async () => import('./customer'));

export function Component() {
  return (
    <Routes>
      <Route element={<Root />}>
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/customer" element={<Customer />} />
      </Route>
    </Routes>
  );
}
