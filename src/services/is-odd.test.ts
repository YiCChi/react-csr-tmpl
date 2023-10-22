import { describe, expect, test } from 'vitest';
import { isOdd } from './is-odd';

describe.concurrent('isOdd', () => {
	test('odd', () => {
		const actual = isOdd(1);

		expect(actual).toBe(true);
	});

	test('even', () => {
		const actual = isOdd(2);

		expect(actual).toBe(false);
	});
});
