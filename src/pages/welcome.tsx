import { useState } from 'react';
import { mayStr } from '../services/may-error';

function Component() {
	const [str, setStr] = useState('empty');

	return (
		<div>
			<div>welcome</div>
			<div>{str}</div>
			<button type="button" onClick={() => setStr(mayStr())}>
				click me
			</button>
		</div>
	);
}

Component.displayName = 'Welcome';

export { Component };
