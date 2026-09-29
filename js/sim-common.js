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
  function time(t, max) { return Number.isFinite(+t) ? Math.max(0, Math.min(+t, max)) : 0; }
  // Grilla fija: como máximo 241 muestras, independiente del refresco y duración.
  function samples(t, max, at, count=240) {
    const end=time(t,max), points=[];
    if (!(max>0)) return [at(0)];
    const n=Math.min(count,Math.floor(end/max*count+1e-10));
    for(let i=0;i<=n;i++) points.push(at(i*max/count));
    if(end-n*max/count>1e-9) points.push(at(end));
    return points;
  }
  function number(value,min=-1e100,max=1e100) {
    if(value===''||value===null||!Number.isFinite(+value)||+value<min||+value>max)
      throw new RangeError(`Introduce un número finito entre ${min} y ${max}.`);
    return +value;
  }
  return { createClock, time, samples, number };
})();
