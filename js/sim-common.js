// Utilidades pequeñas compartidas; sin dependencias.
const SimCommon = (() => {
  function createClock(now = () => performance.now()) {
    let previous = now();
    return {
      reset() { previous = now(); },
      tick() {
        const current = now(), elapsed = (current - previous) / 1000;
        previous = current;
        return Number.isFinite(elapsed) ? Math.max(0, Math.min(elapsed, 0.05)) : 0;
      }
    };
  }
  return { createClock };
})();
