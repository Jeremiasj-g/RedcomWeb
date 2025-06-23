import React from "react";
import { useHighlightMatch } from "../../Hooks/useHighlightMatch";

export default function VendedorCard({ vendedor, searchTerm, onOpenModal }) {
    const nombreResaltado = useHighlightMatch(vendedor.vendedor_nombre, searchTerm);

    return (
        <div className="flex flex-col justify-center h-[300px] rounded-2xl p-4 shadow-lg bg-white relative gap-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex flex-col gap-3 ">
                    <div className="w-10 h-10 rounded-full bg-gray-300 text-center flex items-center justify-center text-sm font-bold text-gray-700">
                        {vendedor.vendedor_nombre.charAt(0) + vendedor.vendedor_nombre.charAt(1)}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg leading-none">{nombreResaltado}</h3>
                    </div>
                </div>

                <span className={`px-3 py-1 text-xs rounded-full font-bold text-white ${vendedor.categoria === 'SENIOR' ? 'bg-emerald-500' :
                        vendedor.categoria === 'SEMI SENIOR' ? 'bg-yellow-500' :
                            vendedor.categoria === 'JUNIOR' ? 'bg-red-500' : 'bg-gray-400'
                    }`}>
                    {vendedor.categoria}
                </span>
            </div>

            <div className="flex flex-col gap-1 text-sm text-gray-700 space-y-1">
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
                onClick={() => onOpenModal(vendedor)}
                className="absolute bottom-3 right-3 size-6 rounded-full bg-gradient-to-r from-gray-400 to-gray-600 text-white text-lg flex items-center justify-center hover:opacity-90 hover:cursor-pointer"
            >
                +
            </button>
        </div>
    );
}
