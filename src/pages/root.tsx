import { Outlet } from 'react-router-dom';

function Component() {
  return (
    <div>
      <div>root</div>
      <Outlet />
    </div>
  );
}

Component.displayName = 'Root';

export { Component };
