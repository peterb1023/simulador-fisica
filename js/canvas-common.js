// Tamaño lógico en píxeles CSS, backing store en píxeles del dispositivo.
const SimCanvas = (() => {
  function resize(canvas) {
    const rect=canvas.getBoundingClientRect();
    const width=Math.max(1,rect.width||canvas.parentElement.clientWidth||640);
    const height=Math.max(1,rect.height||canvas.parentElement.clientHeight||360);
    const dpr=window.devicePixelRatio||1;
    canvas.logicalWidth=width;canvas.logicalHeight=height;
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    canvas.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
    return {width,height};
  }
  function observe(canvases,onResize) {
    const observer=new ResizeObserver(()=>onResize());
    canvases.forEach(c=>observer.observe(c));
    window.addEventListener('resize',onResize);
    // Cambios de pestaña/layout también disparan ResizeObserver.
    return observer;
  }
  return {resize,observe};
})();
