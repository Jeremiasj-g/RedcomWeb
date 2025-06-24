import React from 'react';
import { ESCALAS } from '../utils/constants.js';

const CategoriasTable = () => {
  const categoriaColors = {
    SENIOR: "bg-emerald-500 text-white",
    "SEMI SENIOR": "bg-amber-400 text-white",
    JUNIOR: "bg-rose-500 text-white"
  };

  return (
    <>
      <h2 className="text-xl sm:text-2xl mb-4 font-bold">Escalas de Evaluación</h2>

      <section className="sticky top-20 z-10 bg-white pb-4 shadow-sm overflow-x-auto rounded-lg">
        <table className="min-w-[800px] w-full text-xs text-left mt-2">
          <thead className="text-gray-700 uppercase bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2">Categoría</th>
              <th className="px-3 py-2">Facturación</th>
              <th className="px-3 py-2">Horario</th>
              <th className="px-3 py-2">Efectividad</th>
              <th className="px-3 py-2">Eficiencia</th>
              <th className="px-3 py-2">Cobertura</th>
              <th className="px-3 py-2">Volumen</th>
              <th className="px-3 py-2">% POP</th>
              <th className="px-3 py-2">% Exhibición</th>
              <th className="px-3 py-2">Puntaje</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {ESCALAS.map((obj, i) => {
              const key = Object.keys(obj)[0];
              const c = obj[key];
              return (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  <td className="px-3 py-2 font-semibold">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${categoriaColors[key] || "bg-gray-200"}`}>
                      {key}
                    </span>
                  </td>
                  <td className="px-3 py-2">{c.facturacion}</td>
                  <td className="px-3 py-2">{c.horario_ruta && "✔"}</td>
                  <td className="px-3 py-2">{c.efectividad && "✔"}</td>
                  <td className="px-3 py-2">{c.eficiencia}%</td>
                  <td className="px-3 py-2">{c.cobertura}</td>
                  <td className="px-3 py-2">{c.volumen}</td>
                  <td className="px-3 py-2">{c.pop}%</td>
                  <td className="px-3 py-2">{c.exhibicion}%</td>
                  <td className="px-3 py-2 font-semibold">{c.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
};

export default CategoriasTable;
