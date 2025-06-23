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
import CategoriasTable from "./CategoriasTable";

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
    fallasDetalladas.push({ criterio: "Proyección\nesperada", cumple: cumpleProyeccion, valor: `${proyReal} vs ${proyEsperada}`, puntos: cumpleProyeccion ? 30 : 0 });

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
      fallasDetalladas.push({ criterio: label, cumple, valor: `${real} vs ${esperado}`, puntos: cumple ? peso : 0 });
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

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
            eficiencia: parseFloat(v.eficiencia.replace("%", "")),
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

  const vendedoresFiltrados = data.filter(v =>
    v.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const highlightMatch = (nombre) => {
    if (!searchTerm) return nombre;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const partes = nombre.split(regex);
    return partes.map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200">{part}</mark> : part
    );
  };

  if (loading) return <div className="text-center p-4">Cargando datos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold text-center">Dashboard de Vendedores</h1>

      <CategoriasTable escalas={ESCALAS} />

      <section>
        <div className="flex items-center mb-4 h-14">
          <h2 className="text-2xl font-bold">Vendedores</h2>

          <input
            type="text"
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[400px] border border-gray-300 rounded-md ml-6 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14">
          {vendedoresFiltrados.map((vendedor, i) => (
            <div key={i} className="flex flex-col justify-center h-[300px] rounded-2xl p-4 shadow-lg bg-white relative gap-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-3 ">
                  <div className="w-10 h-10 rounded-full bg-gray-300 text-center flex items-center justify-center text-sm font-bold text-gray-700">
                    {vendedor.vendedor_nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg leading-none">
                      {highlightMatch(vendedor.vendedor_nombre)}
                    </h3>
                  </div>
                </div>

                <span className={`px-3 py-1 text-xs rounded-full font-bold text-white ${
                  vendedor.categoria === 'SENIOR' ? 'bg-emerald-500' :
                  vendedor.categoria === 'SEMI SENIOR' ? 'bg-yellow-500' :
                  vendedor.categoria === 'JUNIOR' ? 'bg-red-500' : 'bg-gray-400'
                }`}>
                  {vendedor.categoria}
                </span>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-700 space-y-1 ">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Eficiencia</span>
                  <span className="font-semibold">{vendedor.eficiencia?.toFixed(2)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full" style={{ width: `${Math.min(vendedor.eficiencia, 100)}%` }}></div>
                </div>
                <div className="flex justify-between pt-2">
                  <p>Cobertura: <strong>{vendedor.cobertura}</strong></p>
                  <p>Volumen: <strong>{vendedor.volumen}</strong></p>
                </div>
                <div className="flex justify-between">
                  <p>POP: <strong>{vendedor["%_POP"]}</strong></p>
                  <p>Exhibición: <strong>{vendedor["%_Exhibición"]}</strong></p>
                </div>
              </div>

              <button
                onClick={() => setModal(vendedor)}
                className="absolute bottom-3 right-3 size-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white text-lg flex items-center justify-center hover:opacity-90 hover:cursor-pointer"
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
            <Dialog.Panel className="bg-white p-6 rounded-lg max-w-[1250px] w-full">
              <Dialog.Title className="text-2xl font-bold mb-6 mt-8 text-center">Análisis de {modal.vendedor_nombre}</Dialog.Title>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(modal.detalle).map(([cat, checks], i) => (
                  <div key={i} className="bg-gray-50 p-5 rounded-xl shadow">
                    <div className="flex justify-between items-center mb-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-bold text-white ${cat === 'SENIOR' ? 'bg-emerald-500' : cat === 'SEMI SENIOR' ? 'bg-yellow-500' : cat === 'JUNIOR' ? 'bg-red-500' : 'bg-gray-400'}`}>
                        {cat}
                      </span>
                      <div className="text-right text-xs text-gray-600">
                        TOTAL PUNTOS<br />
                        <span className="text-xl font-bold text-gray-800">{checks.reduce((acc, c) => acc + (c.puntos || 0), 0)}</span>
                        <span className="text-sm font-normal text-gray-500">/62.75</span>
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {checks.map((check, j) => (
                        <li key={j} className="flex justify-between items-center bg-white p-4 rounded-xl text-sm shadow-ls">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-700">
                              {check.criterio.split('\n').map((line, idx) => (
                                <span key={idx}>
                                  {line}
                                  <br />
                                </span>
                              ))}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs ${check.cumple ? 'text-green-600' : 'text-red-600'} font-medium`}>{check.valor}</p>
                          </div>
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">+{check.puntos}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
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
