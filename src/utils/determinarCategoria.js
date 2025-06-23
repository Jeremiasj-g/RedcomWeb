export function determinarCategoria(escalas, rangos, excepciones, general) {
  const vendedor = general.vendedor;
  const ajustes = excepciones[vendedor] || {};

  const cumpleHorario = general.cumple_horario_ruta === "TRUE";
  const cumpleEfectividad = general.cumple_efectividad === "TRUE";

  const detalle = {};
  let categoriaAsignada = "PLAN DE MEJORA";
  let fallas = [];

  for (const escala of escalas) {
    const categoriaNombre = Object.keys(escala)[0];
    const base = escala[categoriaNombre];
    const r = {
      ...base,
      cobertura: base.cobertura + (ajustes.cobertura ?? 0),
      volumen: base.volumen + (ajustes.volumen ?? 0)
    };

    let puntos = 0;
    const fallasDetalladas = [];

    const proyReal = (general.Categoria_segun_proyeccion || "").trim().toUpperCase();
    const proyEsperada = r.facturacion.trim().toUpperCase();
    const cumpleProyeccion = rangos[proyReal] >= rangos[proyEsperada];
    if (cumpleProyeccion) puntos += 30;
    fallasDetalladas.push({
      criterio: "Proyección\nesperada",
      cumple: cumpleProyeccion,
      valor: `${proyReal} vs ${proyEsperada}`,
      puntos: cumpleProyeccion ? 30 : 0
    });

    const comparaciones = [
      [parseFloat(general.eficiencia), r.eficiencia, "Eficiencia", 15],
      [parseInt(general.cobertura), r.cobertura, "Cobertura", 15],
      [parseInt(general.volumen), r.volumen, "Volumen", 15],
      [parseFloat(general["%_POP"].replace("%", "")), r.pop, "% POP", 5],
      [parseFloat(general["%_Exhibición"].replace("%", "")), r.exhibicion, "% Exhibición", 5]
    ];

    comparaciones.forEach(([real, esperado, label, peso]) => {
      const cumple = parseFloat(real) >= esperado;
      if (cumple) puntos += peso;
      fallasDetalladas.push({
        criterio: label,
        cumple,
        valor: `${real} vs ${esperado}`,
        puntos: cumple ? peso : 0
      });
    });

    detalle[categoriaNombre] = fallasDetalladas;

    if (cumpleHorario && cumpleEfectividad && puntos >= r.total && categoriaAsignada === "PLAN DE MEJORA") {
      categoriaAsignada = categoriaNombre;
      fallas = [];
    }
  }

  if (!cumpleHorario || !cumpleEfectividad) {
    fallas = [
      !cumpleHorario ? "no cumple horario de ruta" : null,
      !cumpleEfectividad ? "no cumple efectividad" : null
    ].filter(Boolean);
  }

  return {
    categoria: categoriaAsignada,
    fallas,
    detalle
  };
}
