import { describe, expect, test } from '@rstest/core';
import { isEven } from './is-even.ts';

describe.concurrent('isEven', () => {
  test('odd', () => {
    const actual = isEven(1);

    expect(actual).toBe(false);
  });

  test('even', () => {
    const actual = isEven(2);

    expect(actual).toBe(true);
  });
});
