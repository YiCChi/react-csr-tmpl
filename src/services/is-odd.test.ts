import { describe, expect, test } from '@rstest/core';
import { isOdd } from './is-odd.ts';

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
