import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

import { Dialog } from "@headlessui/react";

const ESCALAS = [
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

const RANGO_NIVELES = { "PLAN DE MEJORA": 0, "JUNIOR": 1, "SEMI SENIOR": 2, "SENIOR": 3 };

const EXCEPCIONES = { "20 ALAN AYALA": { cobertura: -1, volumen: -1 } };

function determinarCategoria(escalas, general) {
  const vendedor = general.vendedor;
  const ajustes = EXCEPCIONES[vendedor] || {};

  const cumpleHorario = general.cumple_horario_ruta === "TRUE";
  const cumpleEfectividad = general.cumple_efectividad === "TRUE";

  if (!cumpleHorario || !cumpleEfectividad) {
    return {
      categoria: "PLAN DE MEJORA",
      fallas: [
        !cumpleHorario ? "no cumple horario de ruta" : null,
        !cumpleEfectividad ? "no cumple efectividad" : null
      ].filter(Boolean),
      detalle: {}
    };
  }

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
    const cumpleProyeccion = RANGO_NIVELES[proyReal] >= RANGO_NIVELES[proyEsperada];
    if (cumpleProyeccion) puntos += 30;
    fallasDetalladas.push({ criterio: "Proyección esperada", cumple: cumpleProyeccion, valor: `${proyReal} vs ${proyEsperada}` });

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
      fallasDetalladas.push({ criterio: label, cumple, valor: `${real} vs ${esperado}` });
    });

    detalle[categoriaNombre] = fallasDetalladas;

    if (puntos >= r.total && categoriaAsignada === "PLAN DE MEJORA") {
      categoriaAsignada = categoriaNombre;
      fallas = [];
    }
  }

  return {
    categoria: categoriaAsignada,
    fallas,
    detalle
  };
}


export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const generalRes = await fetch("https://sheetdb.io/api/v1/95w3cit39ovoh").then(res => res.json());

        const parsed = generalRes.map((v) => {
          const nombreBase = v.vendedor.replace(/^\d+\s/, "").trim().toUpperCase();
          v.vendedor = v.vendedor.trim().toUpperCase();

          const resultado = determinarCategoria(ESCALAS, v);

          return {
            ...v,
            facturacion: parseFloat(v.facturacion.replace(/[$,]/g, "")),
            vendedor_nombre: nombreBase,
            categoria: resultado.categoria,
            detalle: resultado.detalle
          };
        });

        setData(parsed);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-center p-4">Cargando datos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold text-center">Dashboard de Vendedores</h1>

      {/* <CategoriasTable escalas={ESCALAS} /> */}
      <section className="sticky top-0 z-10 bg-white pb-4 shadow-md overflow-x-auto">
        <h2 className="text-xl font-bold mb-2">Categorías</h2>
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Categoría</th>
              <th className="border px-3 py-2">Facturación</th>
              <th className="border px-3 py-2">Horario ruta</th>
              <th className="border px-3 py-2">Efectividad</th>
              <th className="border px-3 py-2">Eficiencia</th>
              <th className="border px-3 py-2">Cobertura</th>
              <th className="border px-3 py-2">Volumen</th>
              <th className="border px-3 py-2">% POP</th>
              <th className="border px-3 py-2">% Exhibición</th>
              <th className="border px-3 py-2">Puntaje mínimo</th>
            </tr>
          </thead>
          <tbody>
            {ESCALAS.map((obj, i) => {
              const key = Object.keys(obj)[0];
              const c = obj[key];
              return (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="border px-3 py-2 font-semibold">{key}</td>
                  <td className="border px-3 py-2">{c.facturacion}</td>
                  <td className="border px-3 py-2">{c.horario_ruta && "✔"}</td>
                  <td className="border px-3 py-2">{c.efectividad && "✔"}</td>
                  <td className="border px-3 py-2">{c.eficiencia}%</td>
                  <td className="border px-3 py-2">{c.cobertura}</td>
                  <td className="border px-3 py-2">{c.volumen}</td>
                  <td className="border px-3 py-2">{c.pop}%</td>
                  <td className="border px-3 py-2">{c.exhibicion}%</td>
                  <td className="border px-3 py-2">{c.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>



      <section>
        <h2 className="text-xl font-semibold mb-2">Vendedores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((vendedor, i) => (
            <div key={i} className="border rounded-xl p-4 shadow-md relative">
              <h3 className="text-xl font-semibold text-center mb-1">{vendedor.vendedor_nombre}</h3>
              <p className="text-center text-gray-600 mb-3">{vendedor.categoria}</p>
              <div>
                <h4 className="font-semibold mb-2">Datos del vendedor</h4>
                <ul className="text-sm space-y-1">
                  <li>Proyección esperada: <strong>{vendedor.Categoria_segun_proyeccion}</strong></li>
                  <li>Eficiencia: {vendedor.eficiencia}%</li>
                  <li>Cobertura: {vendedor.cobertura}</li>
                  <li>Volumen: {vendedor.volumen}</li>
                  <li>% POP: {vendedor["%_POP"]}</li>
                  <li>% Exhibición: {vendedor["%_Exhibición"]}</li>
                </ul>
              </div>
              <button
                onClick={() => setModal(vendedor)}
                className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black text-white text-lg flex items-center justify-center hover:bg-gray-800"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </section>

      {modal && (
        <Dialog open={true} onClose={() => setModal(null)} className="fixed inset-0 z-20 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
            <Dialog.Panel className="bg-white p-6 rounded-lg max-w-[800px] w-full">
              <Dialog.Title className="text-xl font-bold mb-4">Análisis de {modal.vendedor_nombre}</Dialog.Title>
              <div className="flex gap-10 flex-wrap">
                {Object.entries(modal.detalle).map(([cat, checks], i) => (
                  <div key={i} className="border rounded-md p-3 min-w-[200px]">
                    <h3 className="font-semibold mb-2">{cat}</h3>
                    <ul className="text-sm space-y-1">
                      {checks.map((check, j) => (
                        <li key={j} className={check.cumple ? "text-green-600" : "text-red-600"}>
                          {check.criterio}: {check.valor}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => setModal(null)}
                  className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cerrar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </div>
  );
}
