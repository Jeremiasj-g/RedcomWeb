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

  const datosEficiencia = [
    "efectividad", "porcentaje_de_ventas_en_el_PDV", "porcentaje_de_ventas_a_distancia",
    "eficiencia", "horas_promedio_ruta", "cumple_horario_ruta", "cumple_efectividad"
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

  // ⏱️ Ajuste por excepciones de horario
  const requeridoHorario = EXCEPCIONES[vendedor.vendedor]?.horas_promedio_ruta || REQUERIDOS.horas_promedio_ruta;

  const minutosRequeridos = toMinutos(requeridoHorario);
  const minutosVendedor = toMinutos(vendedor.horas_promedio_ruta);

  const cumpleHorario = minutosVendedor >= minutosRequeridos;
  const cumpleEfect = parseFloat(vendedor.efectividad) >= REQUERIDOS.efectividad;

  const categoriaAsignada = vendedor.categoria || "PLAN DE MEJORA";


  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-20 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 bg-black/50">
        <Dialog.Panel className="bg-white p-6 rounded-lg max-w-[1250px] w-full">
          <div className="flex flex-col items-center">
            <Dialog.Title className="flex items-center gap-4 text-3xl font-bold mb-2 mt-8 text-center">
              Análisis de {vendedor.vendedor_nombre}
              <span className={`px-2 py-1 rounded-full text-xs font-bold ${categoriaColors[categoriaAsignada] || "bg-gray-200 text-black"}`}>
                {categoriaAsignada}
              </span>
            </Dialog.Title>

            <div className="flex gap-10 mb-6 text-sm text-gray-700">
              <div className="flex flex-col items-center px-4 py-2 rounded-md">
                <span className="font-medium">Horario requerido:</span>
                <span>{requeridoHorario}</span>
                <span className="font-medium mt-1">Alcanzado:</span>
                <span className={cumpleHorario ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {vendedor.horas_promedio_ruta} {cumpleHorario ? "✔" : "✘"}
                </span>
              </div>

              <div className="flex flex-col items-center px-4 py-2 rounded-md">
                <span className="font-medium">Efectividad requerida:</span>
                <span>{REQUERIDOS.efectividad}%</span>
                <span className="font-medium mt-1">Alcanzado:</span>
                <span className={cumpleEfect ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                  {vendedor.efectividad}% {cumpleEfect ? "✔" : "✘"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(vendedor.detalle).map(([cat, checks], i) => (
              <div key={i} className="bg-gray-50 p-5 rounded-xl shadow">
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

                    <li key={j} className="flex justify-between items-center bg-white p-4 rounded-xl text-sm shadow-ls border">
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
                        <p className={`text-xs ${check.cumple ? 'text-green-600' : 'text-red-600'} font-medium`}>
                          {check.valor}
                        </p>
                        
                      </div>
                      <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">+{check.puntos}</span>
                    </li>

                  ))}
                </ul>
              </div>
            ))}
          </div>

          {expandido && (
            <div className="mt-10 space-y-6">
              {renderTabla("Datos Generales", datosGenerales)}
              {renderTabla("Datos de Eficiencia", datosEficiencia)}
              {renderTabla("Datos de Facturación", datosFacturacion)}
            </div>
          )}

          <div className="mt-6 text-center space-x-4">
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
