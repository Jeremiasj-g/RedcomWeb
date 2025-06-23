// Sidebar.jsx
import React from "react";

export default function Sidebar({ setView, view }) {
    const items = [
        { label: "Vendedores", key: "vendedores" },
        { label: "Supervisores", key: "supervisores" },
    ];

    return (
        <aside className="w-60 bg-gray-900 text-white flex flex-col shadow-lg">
            <div className="sticky top-21">
                
                <nav className="flex-1 p-2">
                    {items.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setView(item.key)}
                            className={`w-full text-left px-4 py-2 rounded-lg mb-2 transition-all duration-150 ${view === item.key
                                    ? "bg-gray-700 font-semibold"
                                    : "hover:bg-gray-800"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>
            </div>

        </aside>
    );
}
