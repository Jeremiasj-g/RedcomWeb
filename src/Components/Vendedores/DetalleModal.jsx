import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { EXCEPCIONES } from "../../utils/constants";

export default function DetalleModal({ vendedor, onClose }) {
  const [expandido, setExpandido] = useState(false);

  if (!vendedor) return null;

  const categoriaColors = {
    SENIOR: "bg-emerald-500 text-white",
    "SEMI SENIOR": "bg-yellow-500 text-white",
    JUNIOR: "bg-red-500 text-white",
    "PLAN DE MEJORA": "bg-gray-400 text-white"
  };

  const datosGenerales = [
    "vendedor", "facturacion", "total_de_ventas", "visitados",
    "venta_a_distancia", "venta_en_el_pdv", "visitas_planeadas"
  ];

  const EFICIENCIA_METRICAS = [
    {
      id: "efectividad",
      label: "Efectividad",
      numerador: "visitados",
      denominador: "visitas_planeadas",
      formula: "(visitados / visitas planeadas) * 100"
    },
    {
      id: "eficiencia",
      label: "Eficiencia",
      numerador: "total_de_ventas",
      denominador: "visitados",
      formula: "(ventas / visitados) * 100"
    },
    {
      id: "porcentaje_de_ventas_en_el_PDV",
      label: "% Ventas en PDV",
      numerador: "venta_en_el_pdv",
      denominador: "total_de_ventas",
      formula: "(ventas pdv / total ventas) * 100"
    },
    {
      id: "porcentaje_de_ventas_a_distancia",
      label: "% Ventas a Distancia",
      numerador: "venta_a_distancia",
      denominador: "visitas_planeadas",
      formula: "(ventas distancia / visitas planeadas) * 100"
    }
  ];

  const datosFacturacion = [
    "dias_considerados", "promedio_boletas_diarias", "facturacion_promedio",
    "promedio_$_boletas", "Categoria_segun_proyeccion"
  ];

  const renderTabla = (titulo, campos) => (
    <section className="bg-white shadow-sm overflow-x-auto rounded-lg">
      <h3 className="text-xl font-bold px-4 pt-4">{titulo}</h3>
      <table className="min-w-full text-sm text-left mt-2">
        <thead className="text-gray-700 uppercase bg-gray-50">
          <tr>
            {campos.map((campo, i) => (
              <th key={i} className="px-4 py-2 capitalize">
                {campo.replaceAll("_", " ")}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          <tr className="odd:bg-white even:bg-gray-50">
            {campos.map((campo, i) => {
              const valor = vendedor[campo];
              let mostrar = valor ?? "-";

              if (["cumple_horario_ruta", "cumple_efectividad"].includes(campo)) {
                const val = typeof valor === "string" ? valor.toUpperCase() : valor;
                mostrar = val === "TRUE" || val === true ? "✔" : "✘";
              }

              if (["facturacion", "facturacion_promedio", "promedio_$_boletas"].includes(campo) && !isNaN(valor)) {
                mostrar = new Intl.NumberFormat("es-AR", {
                  style: "currency",
                  currency: "ARS",
                  minimumFractionDigits: 2
                }).format(valor);
              }

              return (
                <td key={i} className="px-4 py-2">{mostrar}</td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </section>
  );

  const REQUERIDOS = {
    efectividad: 89,
    horas_promedio_ruta: "5:20:00"
  };

  const toMinutos = (hhmmss) => {
    if (!hhmmss) return 0;
    const [h, m] = hhmmss.split(":").map(Number);
    return h * 60 + m;
  };

  const requeridoHorario = EXCEPCIONES[vendedor.vendedor]?.horas_promedio_ruta || REQUERIDOS.horas_promedio_ruta;

  const minutosRequeridos = toMinutos(requeridoHorario);
  const minutosVendedor = toMinutos(vendedor.horas_promedio_ruta);

  const cumpleHorario = minutosVendedor >= minutosRequeridos;
  const cumpleEfect = parseFloat(vendedor.efectividad) >= REQUERIDOS.efectividad;

  const categoriaAsignada = vendedor.categoria || "PLAN DE MEJORA";

  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-20 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-2 py-6 bg-black/50 backdrop-blur-xs">
        <Dialog.Panel className="bg-white p-4 sm:p-6 rounded-lg w-full max-w-[95%] sm:max-w-[90%] md:max-w-[85%] lg:max-w-[80%] text-sm">
          <div className="flex flex-col items-center">
            <Dialog.Title className="flex flex-wrap items-center justify-center gap-3 text-xl sm:text-2xl md:text-3xl font-bold mb-4 mt-6 text-center">
              Análisis de {vendedor.vendedor_nombre}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${categoriaColors[categoriaAsignada] || "bg-gray-200 text-black"}`}>
                {categoriaAsignada}
              </span>
            </Dialog.Title>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-10 mb-6 text-sm text-gray-700 w-full justify-center">
              <div className="flex flex-col items-center px-4 py-2 rounded-md w-full sm:w-auto">
                <div>
                  <span className="font-medium mr-2">Horario requerido:</span>
                  <span>{requeridoHorario}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium mr-2">Alcanzado:</span>
                  <span className={cumpleHorario ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {vendedor.horas_promedio_ruta} {cumpleHorario ? "✔" : "✘"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center px-4 py-2 rounded-md w-full sm:w-auto">
                <div>
                  <span className="font-medium mr-2">Efectividad requerida:</span>
                  <span>{REQUERIDOS.efectividad}%</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium mr-2">Alcanzado:</span>
                  <span className={cumpleEfect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {vendedor.efectividad}% {cumpleEfect ? "✔" : "✘"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {Object.entries(vendedor.detalle).map(([cat, checks], i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className={`px-3 py-1 text-xs rounded-full font-bold text-white ${categoriaColors[cat] || "bg-gray-400"}`}>
                    {cat}
                  </span>
                  <div className="text-right text-xs text-gray-600">
                    TOTAL PUNTOS<br />
                    <span className="text-xl font-bold text-gray-800">
                      {checks.reduce((acc, c) => acc + (c.puntos || 0), 0)}
                    </span>
                    <span className="text-sm font-normal text-gray-500">/62.75</span>
                  </div>
                </div>

                <ul className="space-y-2">
                  {checks.map((check, j) => (
                    <li key={j} className="flex flex-col gap-3 bg-white p-4 rounded-xl text-sm shadow-ls">
                      <div className="text-gray-700 font-semibold flex justify-between items-center">
                        {check.criterio.replace(/\n/g, " ")}
                        <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs font-bold">+{check.puntos}</span>
                      </div>

                      <div className="text-xs text-gray-600 flex justify-between mb-2">
                        <span>
                          Requerido:{" "}
                          <span className="text-gray-800">
                            {check.valor.includes("vs")
                              ? check.valor.split("vs")[1].trim()
                              : check.requerido || "-"}
                          </span>
                        </span>

                        <span className={`text-end ${check.cumple ? "text-green-600" : "text-red-600"}`}>
                          Alcanzado:{" "}
                          {check.valor.includes("vs")
                            ? check.valor.split("vs")[0].trim()
                            : check.valor}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {expandido && (
            <div className="mt-10 space-y-6">
              {renderTabla("Datos Generales", datosGenerales)}

              <section className="bg-white shadow-sm rounded-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {EFICIENCIA_METRICAS.map(({ id, label, numerador, denominador, formula }) => {
                    const num = Number(vendedor[numerador]);
                    const den = Number(vendedor[denominador]);
                    const porcentaje = den > 0 ? ((num / den) * 100).toFixed(2) : "-";

                    return (
                      <div key={id} className="bg-gray-50 rounded-lg p-4 shadow text-center">
                        <h4 className="text-sm font-semibold mb-2">{label}</h4>
                        <p className="text-3xl font-bold text-gray-800 mb-3">{porcentaje}%</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {denominador.replaceAll("_", " ")}: <strong>{den}</strong>
                        </p>
                        <p className="text-sm text-gray-600 capitalize mb-2">
                          {numerador.replaceAll("_", " ")}: <strong>{num}</strong>
                        </p>
                        <code className="text-xs text-gray-500">{formula}</code>
                      </div>
                    );
                  })}
                </div>
              </section>

              {renderTabla("Datos de Facturación", datosFacturacion)}
            </div>
          )}

          <div className="mt-6 text-center flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setExpandido((prev) => !prev)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              {expandido ? "Ocultar datos" : "Mostrar más"}
            </button>

            <button
              onClick={onClose}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>

  );
}
