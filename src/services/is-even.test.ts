import { describe, expect, test } from 'vitest';
import { isEven } from './is-even';

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
