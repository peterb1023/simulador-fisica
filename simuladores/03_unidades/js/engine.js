// ============================================================
//  engine.js  —  Motor de conversión de unidades (SIM 03)
//  Método: todo se convierte a la unidad BASE primero,
//          luego se convierte al destino.
//  valor_destino = valor_origen × (factor_origen / factor_destino)
// ============================================================

const Engine = (() => {

  // ── Prefijos SI ──────────────────────────────────────────
  // factor = potencia de 10 relativa a la unidad base (sin prefijo)
  const PREFIJOS = [
    { nombre: 'Exa',   simbolo: 'E',  exp:  18 },
    { nombre: 'Peta',  simbolo: 'P',  exp:  15 },
    { nombre: 'Tera',  simbolo: 'T',  exp:  12 },
    { nombre: 'Giga',  simbolo: 'G',  exp:   9 },
    { nombre: 'Mega',  simbolo: 'M',  exp:   6 },
    { nombre: 'Kilo',  simbolo: 'k',  exp:   3 },
    { nombre: 'Hecto', simbolo: 'h',  exp:   2 },
    { nombre: 'Deca',  simbolo: 'da', exp:   1 },
    { nombre: 'Base',  simbolo: '',   exp:   0 },
    { nombre: 'Deci',  simbolo: 'd',  exp:  -1 },
    { nombre: 'Centi', simbolo: 'c',  exp:  -2 },
    { nombre: 'Mili',  simbolo: 'm',  exp:  -3 },
    { nombre: 'Micro', simbolo: 'μ',  exp:  -6 },
    { nombre: 'Nano',  simbolo: 'n',  exp:  -9 },
    { nombre: 'Pico',  simbolo: 'p',  exp: -12 },
    { nombre: 'Femto', simbolo: 'f',  exp: -15 },
    { nombre: 'Atto',  simbolo: 'a',  exp: -18 },
  ];

  // ── Categorías de unidades físicas ───────────────────────
  // factor = cuántas "unidades base SI" equivale 1 de esta unidad
  const CATEGORIAS = [
    {
      nombre: 'Longitud',
      icono: '📏',
      base: 'm',
      unidades: [
        { nombre: 'Metro',       simbolo: 'm',   factor: 1          },
        { nombre: 'Kilómetro',   simbolo: 'km',  factor: 1e3        },
        { nombre: 'Centímetro',  simbolo: 'cm',  factor: 1e-2       },
        { nombre: 'Milímetro',   simbolo: 'mm',  factor: 1e-3       },
        { nombre: 'Micrómetro',  simbolo: 'μm',  factor: 1e-6       },
        { nombre: 'Nanómetro',   simbolo: 'nm',  factor: 1e-9       },
        { nombre: 'Pulgada',     simbolo: 'in',  factor: 0.0254     },
        { nombre: 'Pie',         simbolo: 'ft',  factor: 0.3048     },
        { nombre: 'Milla',       simbolo: 'mi',  factor: 1609.344   },
      ],
    },
    {
      nombre: 'Masa',
      icono: '⚖️',
      base: 'kg',
      unidades: [
        { nombre: 'Kilogramo',   simbolo: 'kg',  factor: 1          },
        { nombre: 'Gramo',       simbolo: 'g',   factor: 1e-3       },
        { nombre: 'Miligramo',   simbolo: 'mg',  factor: 1e-6       },
        { nombre: 'Tonelada',    simbolo: 't',   factor: 1e3        },
        { nombre: 'Libra',       simbolo: 'lb',  factor: 0.453592   },
        { nombre: 'Onza',        simbolo: 'oz',  factor: 0.0283495  },
      ],
    },
    {
      nombre: 'Tiempo',
      icono: '⏱',
      base: 's',
      unidades: [
        { nombre: 'Segundo',     simbolo: 's',   factor: 1          },
        { nombre: 'Milisegundo', simbolo: 'ms',  factor: 1e-3       },
        { nombre: 'Minuto',      simbolo: 'min', factor: 60         },
        { nombre: 'Hora',        simbolo: 'h',   factor: 3600       },
        { nombre: 'Día',         simbolo: 'd',   factor: 86400      },
      ],
    },
    {
      nombre: 'Velocidad',
      icono: '🚀',
      base: 'm/s',
      unidades: [
        { nombre: 'm/s',         simbolo: 'm/s',  factor: 1         },
        { nombre: 'km/h',        simbolo: 'km/h', factor: 1/3.6     },
        { nombre: 'cm/s',        simbolo: 'cm/s', factor: 1e-2      },
        { nombre: 'ft/s',        simbolo: 'ft/s', factor: 0.3048    },
        { nombre: 'mph',         simbolo: 'mph',  factor: 0.44704   },
        { nombre: 'Nudo',        simbolo: 'kn',   factor: 0.514444  },
      ],
    },
    {
      nombre: 'Fuerza',
      icono: '💪',
      base: 'N',
      unidades: [
        { nombre: 'Newton',      simbolo: 'N',   factor: 1          },
        { nombre: 'Kilonewton',  simbolo: 'kN',  factor: 1e3        },
        { nombre: 'Meganewton',  simbolo: 'MN',  factor: 1e6        },
        { nombre: 'Dina',        simbolo: 'dyn', factor: 1e-5       },
        { nombre: 'Kilogramo-fuerza', simbolo: 'kgf', factor: 9.80665 },
        { nombre: 'Libra-fuerza', simbolo: 'lbf', factor: 4.44822  },
      ],
    },
    {
      nombre: 'Energía',
      icono: '⚡',
      base: 'J',
      unidades: [
        { nombre: 'Joule',       simbolo: 'J',   factor: 1          },
        { nombre: 'Kilojule',    simbolo: 'kJ',  factor: 1e3        },
        { nombre: 'Megajule',    simbolo: 'MJ',  factor: 1e6        },
        { nombre: 'Caloría',     simbolo: 'cal', factor: 4.184      },
        { nombre: 'Kilocaloría', simbolo: 'kcal',factor: 4184       },
        { nombre: 'Watt-hora',   simbolo: 'Wh',  factor: 3600       },
        { nombre: 'kWh',         simbolo: 'kWh', factor: 3.6e6      },
        { nombre: 'eV',          simbolo: 'eV',  factor: 1.60218e-19},
        { nombre: 'BTU',         simbolo: 'BTU', factor: 1055.06    },
      ],
    },
    {
      nombre: 'Potencia',
      icono: '🔋',
      base: 'W',
      unidades: [
        { nombre: 'Watt',        simbolo: 'W',   factor: 1          },
        { nombre: 'Kilowatt',    simbolo: 'kW',  factor: 1e3        },
        { nombre: 'Megawatt',    simbolo: 'MW',  factor: 1e6        },
        { nombre: 'Caballo de vapor', simbolo: 'hp', factor: 745.7  },
        { nombre: 'kcal/s',      simbolo: 'kcal/s', factor: 4184   },
      ],
    },
    {
      nombre: 'Presión',
      icono: '🌡',
      base: 'Pa',
      unidades: [
        { nombre: 'Pascal',      simbolo: 'Pa',  factor: 1          },
        { nombre: 'Kilopascal',  simbolo: 'kPa', factor: 1e3        },
        { nombre: 'Megapascal',  simbolo: 'MPa', factor: 1e6        },
        { nombre: 'Bar',         simbolo: 'bar', factor: 1e5        },
        { nombre: 'Atmósfera',   simbolo: 'atm', factor: 101325     },
        { nombre: 'mmHg (Torr)', simbolo: 'mmHg',factor: 133.322    },
        { nombre: 'PSI',         simbolo: 'psi', factor: 6894.76    },
      ],
    },
    {
      nombre: 'Área',
      icono: '▪',
      base: 'm²',
      unidades: [
        { nombre: 'Metro²',      simbolo: 'm²',  factor: 1          },
        { nombre: 'Centímetro²', simbolo: 'cm²', factor: 1e-4       },
        { nombre: 'Kilómetro²',  simbolo: 'km²', factor: 1e6        },
        { nombre: 'Hectárea',    simbolo: 'ha',  factor: 1e4        },
        { nombre: 'Pulgada²',    simbolo: 'in²', factor: 6.4516e-4  },
        { nombre: 'Pie²',        simbolo: 'ft²', factor: 0.0929     },
      ],
    },
    {
      nombre: 'Temperatura',
      icono: '🌡',
      base: 'K',
      unidades: [
        { nombre: 'Kelvin',      simbolo: 'K',   factor: 1, offset: 0        },
        { nombre: 'Celsius',     simbolo: '°C',  factor: 1, offset: 273.15   },
        { nombre: 'Fahrenheit',  simbolo: '°F',  factor: 5/9, offset: 459.67 },
      ],
      esTemp: true,
    },
  ];

  // ── Conversión principal ─────────────────────────────────
  // Retorna { resultado, pasos[] }
  function convertir(valor, catNombre, simOrigen, simDestino) {
    if(!Number.isFinite(+valor)||valor==='')return null;
    valor=+valor;
    const cat = CATEGORIAS.find(c => c.nombre === catNombre);
    if (!cat) return null;

    const uO = cat.unidades.find(u => u.simbolo === simOrigen);
    const uD = cat.unidades.find(u => u.simbolo === simDestino);
    if (!uO || !uD) return null;

    let resultado, pasos;

    if (cat.esTemp) {
      // Temperatura: conversión especial con offset
      // Paso 1: a Kelvin
      const enKelvin = (valor + uO.offset) * uO.factor;
      if(enKelvin<0)return null;
      // Paso 2: de Kelvin a destino
      resultado = enKelvin / uD.factor - uD.offset;

      pasos = [
        {
          formula: `${simOrigen} → K`,
          expr: `(${fmtN(valor)} + ${uO.offset}) × ${fmtN(uO.factor)}`,
          resultado: `${fmtN(enKelvin)} K`,
        },
        {
          formula: `K → ${simDestino}`,
          expr: `${fmtN(enKelvin)} ÷ ${fmtN(uD.factor)} − ${uD.offset}`,
          resultado: `${fmtN(resultado)} ${simDestino}`,
        },
      ];
    } else {
      // Método estándar: origen → base → destino
      // valor_base = valor × factor_origen
      const enBase = valor * uO.factor;
      // valor_destino = valor_base / factor_destino
      resultado = enBase / uD.factor;

      const factorDirecto = uO.factor / uD.factor;

      pasos = [
        {
          formula: `${simOrigen} → ${cat.base}`,
          expr: `${fmtN(valor)} × ${fmtE(uO.factor)}`,
          resultado: `${fmtN(enBase)} ${cat.base}`,
        },
        {
          formula: `${cat.base} → ${simDestino}`,
          expr: `${fmtN(enBase)} ÷ ${fmtE(uD.factor)}`,
          resultado: `${fmtN(resultado)} ${simDestino}`,
        },
        {
          formula: 'Factor directo',
          expr: `${fmtE(uO.factor)} ÷ ${fmtE(uD.factor)}`,
          resultado: `1 ${simOrigen} = ${fmtE(factorDirecto)} ${simDestino}`,
          esFactor: true,
        },
      ];
    }

    if(!Number.isFinite(resultado))return null;
    return { resultado, pasos, uOrigen: uO, uDestino: uD };
  }

  // ── Conversión de prefijo SI ─────────────────────────────
  function convertirPrefijo(valor, expOrigen, expDestino) {
    // valor × 10^(expOrigen - expDestino)
    if(![valor,expOrigen,expDestino].every(Number.isFinite))return null;
    const diffExp = expOrigen - expDestino;
    const resultado = valor * Math.pow(10, diffExp);
    const pasos = [
      {
        formula: 'Diferencia de exponentes',
        expr: `exp_origen − exp_destino = ${expOrigen} − (${expDestino}) = ${diffExp}`,
        resultado: `Factor = 10^${diffExp}`,
      },
      {
        formula: 'Aplicar factor',
        expr: `${fmtN(valor)} × 10^${diffExp}`,
        resultado: `${fmtN(resultado)}`,
        esFactor: false,
      },
    ];
    return Number.isFinite(resultado)?{ resultado, pasos }:null;
  }

  // ── Formateo de números ──────────────────────────────────
  function fmtN(n) {
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e-4 && abs < 1e7) {
      return parseFloat(n.toPrecision(6)).toString();
    }
    return n.toExponential(3);
  }

  function fmtE(n) {
    if (n === 0) return '0';
    const abs = Math.abs(n);
    if (abs >= 0.001 && abs < 10000) return parseFloat(n.toPrecision(6)).toString();
    // Notación científica bonita
    const exp = Math.floor(Math.log10(abs));
    const mant = n / Math.pow(10, exp);
    if (Math.abs(mant - 1) < 0.0001) return `10^${exp}`;
    return `${parseFloat(mant.toPrecision(3))}×10^${exp}`;
  }

  return {
    PREFIJOS,
    CATEGORIAS,
    convertir,
    convertirPrefijo,
    fmtN,
    fmtE,
  };

})();
