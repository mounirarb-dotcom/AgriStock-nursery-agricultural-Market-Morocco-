import { describe, it, expect, vi } from 'vitest';
import { debounce, throttle, memoize } from '../utils/performanceUtils';

describe('Performance Utilities', () => {
  it('debounces rapid calls into a single execution', async () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced();
    debounced();
    debounced();

    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(250);
    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports debounce flush to immediately execute pending call', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 200);

    debounced('urgent-update');
    expect(callback).not.toHaveBeenCalled();

    debounced.flush();
    expect(callback).toHaveBeenCalledWith('urgent-update');
    expect(callback).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(300);
    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('supports debounce leading execution', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const debounced = debounce(callback, 200, { leading: true, trailing: false });

    debounced('first');
    expect(callback).toHaveBeenCalledWith('first');
    expect(callback).toHaveBeenCalledTimes(1);

    debounced('second');
    vi.advanceTimersByTime(250);
    expect(callback).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('throttles rapid calls', () => {
    vi.useFakeTimers();
    const callback = vi.fn();
    const throttled = throttle(callback, 100);

    throttled();
    throttled();
    throttled();

    expect(callback).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(110);
    expect(callback).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });

  it('memoizes calculation results and avoids re-computation', () => {
    const compute = vi.fn((x: number) => x * 42);
    const memoized = memoize(compute);

    expect(memoized(10)).toBe(420);
    expect(memoized(10)).toBe(420);
    expect(compute).toHaveBeenCalledTimes(1);

    expect(memoized(20)).toBe(840);
    expect(compute).toHaveBeenCalledTimes(2);
  });

  it('evicts least recently used items in true LRU order when cache capacity is exceeded', () => {
    const compute = vi.fn((key: string) => `value-${key}`);
    const memoized = memoize(compute, { maxCacheSize: 3, evictionPolicy: 'LRU' });

    memoized('A'); // cache: [A]
    memoized('B'); // cache: [A, B]
    memoized('C'); // cache: [A, B, C]
    expect(memoized.size()).toBe(3);

    // Access 'A' -> becomes most recently used! cache order is now [B, C, A]
    expect(memoized('A')).toBe('value-A');
    expect(compute).toHaveBeenCalledTimes(3);

    // Adding 'D' should evict 'B' (the least recently used), NOT 'A'
    memoized('D');
    expect(memoized.size()).toBe(3);
    expect(memoized.has('A')).toBe(true);
    expect(memoized.has('C')).toBe(true);
    expect(memoized.has('D')).toBe(true);
    expect(memoized.has('B')).toBe(false);

    // Calling 'A' again uses cache
    memoized('A');
    expect(compute).toHaveBeenCalledTimes(4); // 3 initial + 1 for D

    // Calling 'B' requires recomputation because it was evicted
    memoized('B');
    expect(compute).toHaveBeenCalledTimes(5);
  });

  it('supports memoize clear, delete, and size inspection', () => {
    const compute = (x: number, y: number) => x + y;
    const memoized = memoize(compute);

    memoized(5, 10);
    memoized(20, 30);
    expect(memoized.size()).toBe(2);
    expect(memoized.has(5, 10)).toBe(true);

    expect(memoized.delete(5, 10)).toBe(true);
    expect(memoized.has(5, 10)).toBe(false);
    expect(memoized.size()).toBe(1);

    memoized.clear();
    expect(memoized.size()).toBe(0);
  });
});

