// Polyfills for Mobile Safari (iOS), legacy webviews, and cross-browser compatibility

// 1. Promise.withResolvers polyfill (iOS Safari < 17.4)
if (typeof (Promise as any).withResolvers === 'undefined') {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

// 2. Object.hasOwn polyfill (iOS Safari < 15.4)
if (typeof Object.hasOwn === 'undefined') {
  Object.hasOwn = function (obj: any, prop: PropertyKey) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  };
}

// 3. Array.prototype.at polyfill (iOS Safari < 15.4)
if (typeof (Array.prototype as any).at === 'undefined') {
  (Array.prototype as any).at = function (n: number) {
    n = Math.trunc(n) || 0;
    if (n < 0) n += this.length;
    if (n < 0 || n >= this.length) return undefined;
    return this[n];
  };
}

// 4. structuredClone polyfill (iOS Safari < 15.4)
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = function <T>(obj: T): T {
    if (obj === undefined) return undefined as any;
    return JSON.parse(JSON.stringify(obj));
  };
}

// Feature detection helper for Mobile Safari
export function isIOS(): boolean {
  if (typeof window === 'undefined' || !window.navigator) return false;
  const ua = window.navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1)
  );
}
