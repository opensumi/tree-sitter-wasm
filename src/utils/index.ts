export * from './lru-cache';

export function invert(obj: Record<string, string>) {
  const result: Record<string, string> = {};
  for (const key of Object.keys(obj)) {
    result[obj[key]] = key;
  }
  return result;
}

/**
 * An object that exposes a promise and functions to resolve and reject it.
 */
export class PromiseWithResolvers<T> {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: any) => void;

  promise = new Promise<T>((resolve, reject) => {
    this.resolve = resolve;
    this.reject = reject;
  });
}
