import { Outlet } from 'react-router';
import { CounterContextProvider } from '../context/index.ts';

function Component() {
  console.log('this is backend uri', import.meta.env.PUBLIC_API_URL);

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
