import { Outlet } from 'react-router';
import { CounterContextProvider } from '../../context/counter-context.tsx';

function Component() {
  return (
    <CounterContextProvider>
      <div>
        <div>root</div>
        <Outlet />
      </div>
    </CounterContextProvider>
  );
}

Component.displayName = 'Root';

export { Component };
