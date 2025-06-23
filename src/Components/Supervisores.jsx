// Supervisores.jsx
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function Supervisores() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("https://sheetdb.io/api/v1/95w3cit39ovoh")
      .then((res) => res.json())
      .then((json) => {
        const parsed = json.map((v) => ({
          ...v,
          vendedor: v.vendedor?.replace(/^[0-9]+\s/, "") || "",
          facturacion: parseFloat(v.facturacion?.replace(/[$,]/g, "")) || 0,
          efectividad: parseFloat(v.efectividad?.replace("%", "")) || 0,
          eficiencia: parseFloat(v.eficiencia?.replace("%", "")) || 0,
          visitas: parseInt(v.visitados) || 0,
          ventasPDV: parseInt(v.venta_en_el_pdv) || 0,
          ventasDistancia: parseInt(v.venta_a_distancia) || 0,
          pop: parseFloat(v["%_POP"]?.replace("%", "")) || 0,
          exhibicion: parseFloat(v["%_Exhibición"]?.replace("%", "")) || 0,
        }));
        setData(parsed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center">Cargando...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-12">
      <h1 className="text-3xl font-bold text-center">Dashboard de Supervisores</h1>

      <section>
        <h2 className="text-xl font-semibold mb-2">Facturación por Vendedor</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="vendedor" interval={0} angle={-45} textAnchor="end" />
            <YAxis tickFormatter={(v) => `$${(v / 1e6).toFixed(1)}M`} />
            <Tooltip formatter={(v) => `$${v.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="facturacion" fill="#4f46e5" name="Facturación" />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Eficiencia</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendedor" angle={-45} textAnchor="end" interval={0} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="eficiencia" stroke="#10b981" name="Eficiencia" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">Efectividad</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="vendedor" angle={-45} textAnchor="end" interval={0} />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} />
              <Legend />
              <Line type="monotone" dataKey="efectividad" stroke="#f59e0b" name="Efectividad" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Distribución de Ventas</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data.map((v) => ({
                name: v.vendedor,
                value: v.ventasPDV + v.ventasDistancia
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {data.map((_, i) => (
                <Cell key={`cell-${i}`} fill={["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#3b82f6"][i % 5]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
