import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

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

const COLORS = {
  SENIOR: '#10B981',
  'SEMI SENIOR': '#F59E0B',
  JUNIOR: '#EF4444',
  'PLAN DE MEJORA': '#6B7280'
};

const CHART_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B'];

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
  const [activeView, setActiveView] = useState('grid');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulando datos para el ejemplo
        const mockData = [
          {
            vendedor: "1 JUAN PEREZ",
            vendedor_nombre: "JUAN PEREZ",
            facturacion: 150000,
            cumple_horario_ruta: "TRUE",
            cumple_efectividad: "TRUE",
            eficiencia: 85,
            cobertura: 8,
            volumen: 8,
            "%_POP": "82%",
            "%_Exhibición": "72%",
            Categoria_segun_proyeccion: "SENIOR"
          },
          {
            vendedor: "2 MARIA GARCIA",
            vendedor_nombre: "MARIA GARCIA", 
            facturacion: 120000,
            cumple_horario_ruta: "TRUE",
            cumple_efectividad: "TRUE",
            eficiencia: 80,
            cobertura: 6,
            volumen: 6,
            "%_POP": "76%",
            "%_Exhibición": "62%",
            Categoria_segun_proyeccion: "SEMI SENIOR"
          },
          {
            vendedor: "3 CARLOS LOPEZ",
            vendedor_nombre: "CARLOS LOPEZ",
            facturacion: 90000,
            cumple_horario_ruta: "TRUE",
            cumple_efectividad: "FALSE",
            eficiencia: 75,
            cobertura: 5,
            volumen: 5,
            "%_POP": "71%",
            "%_Exhibición": "52%",
            Categoria_segun_proyeccion: "JUNIOR"
          }
        ];

        const parsed = mockData.map((v) => {
          const nombreBase = v.vendedor.replace(/^\d+\s/, "").trim().toUpperCase();
          v.vendedor = v.vendedor.trim().toUpperCase();
          const resultado = determinarCategoria(ESCALAS, v);
          return {
            ...v,
            facturacion: typeof v.facturacion === 'string' ? parseFloat(v.facturacion.replace(/[$,]/g, "")) : v.facturacion,
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

  const getCategoryCounts = () => {
    const counts = {};
    data.forEach(v => {
      counts[v.categoria] = (counts[v.categoria] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count, color: COLORS[name] }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-purple-300 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-300 border-b-transparent rounded-full animate-spin animate-reverse"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <div className="text-white text-xl">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="relative px-6 py-12 mx-auto max-w-7xl">
          <div className="text-center">
            <h1 className="text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent mb-4 animate-pulse">
              Sales Analytics
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Dashboard inteligente para el análisis de rendimiento de vendedores
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12 mx-auto max-w-7xl space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: 'Total Vendedores', value: data.length, icon: '👥', color: 'from-blue-500 to-purple-600' },
            { label: 'Senior', value: data.filter(v => v.categoria === 'SENIOR').length, icon: '⭐', color: 'from-green-500 to-emerald-600' },
            { label: 'Semi Senior', value: data.filter(v => v.categoria === 'SEMI SENIOR').length, icon: '🔥', color: 'from-yellow-500 to-orange-600' },
            { label: 'Planes de Mejora', value: data.filter(v => v.categoria === 'PLAN DE MEJORA').length, icon: '📈', color: 'from-red-500 to-pink-600' }
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-purple-500/25`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 text-sm font-medium">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
                </div>
                <div className="text-4xl opacity-80">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Distribution Chart */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></span>
              Distribución por Categoría
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryCounts()}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  stroke="none"
                >
                  {getCategoryCounts().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Chart */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="w-3 h-3 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></span>
              Rendimiento por Eficiencia
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="vendedor_nombre" tick={{fill: 'white', fontSize: 12}} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{fill: 'white'}} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white'
                  }}
                />
                <Bar dataKey="eficiencia" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <span className="w-4 h-4 bg-gradient-to-r from-yellow-400 to-red-400 rounded-full"></span>
            Escalas de Evaluación
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-white">
              <thead>
                <tr className="border-b border-white/20">
                  {['Categoría', 'Facturación', 'Horario', 'Efectividad', 'Eficiencia', 'Cobertura', 'Volumen', '% POP', '% Exhibición', 'Puntaje'].map((header, i) => (
                    <th key={i} className="px-4 py-4 text-left font-semibold text-gray-200">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ESCALAS.map((obj, i) => {
                  const key = Object.keys(obj)[0];
                  const c = obj[key];
                  return (
                    <tr key={i} className="border-b border-white/10 hover:bg-white/5 transition-colors duration-200">
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white`} style={{backgroundColor: COLORS[key]}}>
                          {key}
                        </span>
                      </td>
                      <td className="px-4 py-4">{c.facturacion}</td>
                      <td className="px-4 py-4">{c.horario_ruta && <span className="text-green-400 text-xl">✓</span>}</td>
                      <td className="px-4 py-4">{c.efectividad && <span className="text-green-400 text-xl">✓</span>}</td>
                      <td className="px-4 py-4 font-semibold">{c.eficiencia}%</td>
                      <td className="px-4 py-4">{c.cobertura}</td>
                      <td className="px-4 py-4">{c.volumen}</td>
                      <td className="px-4 py-4">{c.pop}%</td>
                      <td className="px-4 py-4">{c.exhibicion}%</td>
                      <td className="px-4 py-4 font-bold">{c.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex justify-center gap-4">
          {[
            { id: 'grid', icon: '⋮⋮⋮', label: 'Vista Grid' },
            { id: 'list', icon: '☰', label: 'Vista Lista' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`px-6 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                activeView === view.id
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              <span className="mr-2">{view.icon}</span>
              {view.label}
            </button>
          ))}
        </div>

        {/* Vendedores Section */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <span className="w-4 h-4 bg-gradient-to-r from-green-400 to-blue-400 rounded-full"></span>
            Equipo de Ventas
          </h2>
          
          {activeView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.map((vendedor, i) => (
                <div key={i} className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-6 shadow-2xl hover:shadow-purple-500/25 transform hover:scale-105 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {vendedor.vendedor_nombre.charAt(0)}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white`} style={{backgroundColor: COLORS[vendedor.categoria]}}>
                        {vendedor.categoria}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">{vendedor.vendedor_nombre}</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Eficiencia</span>
                        <span className="text-white font-semibold">{vendedor.eficiencia}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                          style={{width: `${vendedor.eficiencia}%`}}
                        ></div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-gray-300">Cobertura: <span className="text-white font-semibold">{vendedor.cobertura}</span></div>
                        <div className="text-gray-300">Volumen: <span className="text-white font-semibold">{vendedor.volumen}</span></div>
                        <div className="text-gray-300">POP: <span className="text-white font-semibold">{vendedor["%_POP"]}</span></div>
                        <div className="text-gray-300">Exhibición: <span className="text-white font-semibold">{vendedor["%_Exhibición"]}</span></div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setModal(vendedor)}
                      className="absolute -bottom-3 -right-3 w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-bold text-xl shadow-lg hover:shadow-purple-500/50 transform hover:rotate-90 transition-all duration-300 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((vendedor, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl hover:shadow-purple-500/25 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {vendedor.vendedor_nombre.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{vendedor.vendedor_nombre}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white`} style={{backgroundColor: COLORS[vendedor.categoria]}}>
                          {vendedor.categoria}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{vendedor.eficiencia}%</div>
                        <div className="text-xs text-gray-300">Eficiencia</div>
                      </div>
                      <button
                        onClick={() => setModal(vendedor)}
                        className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full text-white font-bold shadow-lg hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center"
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(null)}></div>
          <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {modal.vendedor_nombre.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{modal.vendedor_nombre}</h2>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold text-white`} style={{backgroundColor: COLORS[modal.categoria]}}>
                    {modal.categoria}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
                className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full text-white font-bold text-xl transition-all duration-300 flex items-center justify-center"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(modal.detalle).map(([cat, checks], i) => (
                <div key={i} className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"></span>
                    {cat}
                  </h3>
                  <div className="space-y-3">
                    {checks.map((check, j) => (
                      <div key={j} className={`flex items-center gap-3 p-3 rounded-xl ${check.cumple ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${check.cumple ? 'bg-green-500' : 'bg-red-500'}`}>
                          {check.cumple ? '✓' : '✗'}
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">{check.criterio}</div>
                          <div className="text-gray-300 text-xs">{check.valor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}