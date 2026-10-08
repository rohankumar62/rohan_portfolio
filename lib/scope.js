// Own every listener, observer, frame and WebGL resource for React effect cleanup.
export function createScope() {
  let disposed = false;
  const cleanups = [], frames = new Set();
  const controller = new AbortController();
  const scope = {
    get disposed() { return disposed; },
    signal: controller.signal,
    cleanup(fn) { if (disposed) fn(); else cleanups.push(fn); },
    listen(target, type, fn, options) {
      const guarded = (...args) => { if (!disposed) fn(...args); };
      target.addEventListener(type, guarded, options);
      scope.cleanup(() => target.removeEventListener(type, guarded, options));
    },
    requestAnimationFrame(fn) {
      if (disposed) return 0;
      const id = window.requestAnimationFrame(time => { frames.delete(id); if (!disposed) fn(time); });
      frames.add(id); return id;
    },
    cancelAnimationFrame(id) { frames.delete(id); window.cancelAnimationFrame(id); },
    dispose() {
      disposed = true; controller.abort();
      frames.forEach(id => window.cancelAnimationFrame(id)); frames.clear();
      cleanups.reverse().forEach(fn => fn());
    }
  };
  for (const name of ['IntersectionObserver', 'ResizeObserver', 'MutationObserver']) {
    scope[name] = class {
      constructor(callback, options) {
        const observer = new window[name]((...args) => { if (!disposed) callback(...args); }, options);
        scope.cleanup(() => observer.disconnect()); return observer;
      }
    };
  }
  return scope;
}
