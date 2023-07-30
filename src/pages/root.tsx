import { Outlet } from 'react-router-dom';

function Component() {
  console.log('this is backend uri', import.meta.env.VITE_API_URL);

  return (
    <div>
      <div>root</div>
      <Outlet />
    </div>
  );
}

Component.displayName = 'Root';

export { Component };
