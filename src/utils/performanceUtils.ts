/**
 * High-performance utilities for AgriStock:
 * - Debouncing (search inputs, resize handlers) with leading/trailing controls
 * - Throttling (scroll, resize, live ticker streams) with leading/trailing controls
 * - Memoization with true LRU (Least Recently Used) cache, key serialization, and cache management
 */

export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function debounce<T extends (...args: any[]) => void>(
  fn: T,
  delay = 250,
  options: DebounceOptions = {}
): ((...args: Parameters<T>) => void) & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true } = options;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const debounced = (...args: Parameters<T>) => {
    lastArgs = args;
    const isFirstCall = !timeoutId;

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (leading && isFirstCall) {
      fn(...args);
    }

    timeoutId = setTimeout(() => {
      if (trailing && (!leading || !isFirstCall) && lastArgs) {
        fn(...lastArgs);
      }
      timeoutId = null;
      lastArgs = null;
    }, delay);
  };

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timeoutId && lastArgs) {
      clearTimeout(timeoutId);
      fn(...lastArgs);
      timeoutId = null;
      lastArgs = null;
    }
  };

  return debounced;
}

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  delay = 100,
  options: ThrottleOptions = {}
): ((...args: Parameters<T>) => void) & { cancel: () => void } {
  const { leading = true, trailing = true } = options;
  let lastExec = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;

  const throttled = (...args: Parameters<T>) => {
    const now = Date.now();
    lastArgs = args;

    if (!lastExec && !leading) {
      lastExec = now;
    }

    const remaining = delay - (now - lastExec);

    if (remaining <= 0 || remaining > delay) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastExec = now;
      fn(...args);
    } else if (!timeoutId && trailing) {
      timeoutId = setTimeout(() => {
        lastExec = leading ? Date.now() : 0;
        timeoutId = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, remaining);
    }
  };

  throttled.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    lastExec = 0;
    lastArgs = null;
  };

  return throttled;
}

export interface MemoizeOptions<T extends (...args: any[]) => any> {
  maxCacheSize?: number;
  keySerializer?: (...args: Parameters<T>) => string;
  evictionPolicy?: 'LRU' | 'FIFO';
}

export interface MemoizedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  clear: () => void;
  delete: (...args: Parameters<T>) => boolean;
  has: (...args: Parameters<T>) => boolean;
  size: () => number;
}

/**
 * True LRU (Least Recently Used) bounded memoizer for high-throughput computations
 * (e.g. agronomic formulas, currency forex normalizers, tax and commission calculations).
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: number | MemoizeOptions<T> = {}
): MemoizedFunction<T> {
  const opts: MemoizeOptions<T> = typeof options === 'number' ? { maxCacheSize: options } : options;
  const {
    maxCacheSize = 128,
    keySerializer = (...args: Parameters<T>) => JSON.stringify(args),
    evictionPolicy = 'LRU',
  } = opts;

  // JavaScript Map preserves insertion order.
  // In LRU, on access, we delete and re-insert the key so it moves to the end (most recently used).
  // The first item (cache.keys().next().value) is always the least recently used.
  const cache = new Map<string, ReturnType<T>>();

  const memoized = ((...args: Parameters<T>): ReturnType<T> => {
    const key = keySerializer(...args);

    if (cache.has(key)) {
      const existing = cache.get(key)!;
      if (evictionPolicy === 'LRU') {
        cache.delete(key);
        cache.set(key, existing);
      }
      return existing;
    }

    const result = fn(...args);

    if (cache.size >= maxCacheSize) {
      const oldestKey = cache.keys().next().value;
      if (oldestKey !== undefined) {
        cache.delete(oldestKey);
      }
    }

    cache.set(key, result);
    return result;
  }) as MemoizedFunction<T>;

  memoized.clear = () => {
    cache.clear();
  };

  memoized.delete = (...args: Parameters<T>) => {
    const key = keySerializer(...args);
    return cache.delete(key);
  };

  memoized.has = (...args: Parameters<T>) => {
    const key = keySerializer(...args);
    return cache.has(key);
  };

  memoized.size = () => cache.size;

  return memoized;
}

