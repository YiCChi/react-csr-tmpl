export function mayStr() {
	if (Math.floor(Math.random() * 10) % 2 === 1) {
		throw new Error('ops, error');
	}

	return 'normally end';
}
