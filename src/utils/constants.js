export const ESCALAS = [ 
  {
    "SENIOR": {
      facturacion: 'SENIOR', horario_ruta: true, efectividad: true,
      eficiencia: 84, cobertura: 7, volumen: 7, pop: 79.99, exhibicion: 69.99, total: 62.75
    }
  },
  {
    "SEMI SENIOR": {
      facturacion: 'SEMI SENIOR', horario_ruta: true, efectividad: true,
      eficiencia: 79, cobertura: 6, volumen: 6, pop: 74.99, exhibicion: 59.99, total: 62.75
    }
  },
  {
    "JUNIOR": {
      facturacion: 'JUNIOR', horario_ruta: true, efectividad: true,
      eficiencia: 74, cobertura: 5, volumen: 5, pop: 69.99, exhibicion: 49.99, total: 62.75
    }
  }
];

export const RANGO_NIVELES = {
  "PLAN DE MEJORA": 0,
  "JUNIOR": 1,
  "SEMI SENIOR": 2,
  "SENIOR": 3
};

// 👇 Ampliado para incluir excepciones de horario
export const EXCEPCIONES = {
  "20 ALAN AYALA": { cobertura: -1, volumen: -1 },
  "15 LEANDRO ORTIZ": { horas_promedio_ruta: "5:00:00" },
  "16 GABRIEL GOMEZ": { horas_promedio_ruta: "5:00:00" },
  "17 JONATAN GARRIDO": { horas_promedio_ruta: "5:00:00" }
};
