import { Outlet } from 'react-router-dom';
import { CounterContextProvider } from '../context';

function Component() {
  console.log('this is backend uri', import.meta.env.VITE_API_URL);

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
