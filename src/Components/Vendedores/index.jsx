import { useState } from "react";
import { useFetchVendedores } from "../../Hooks/useFetchVendedores";
import VendedorCard from "./VendedorCard";
import DetalleModal from "./DetalleModal";
import CategoriasTable from "../CategoriasTable";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

const TAGS = [
  { label: "Todas", value: "" },
  { label: "Senior", value: "SENIOR", color: "bg-emerald-500 text-white font-semibold" },
  { label: "Semi Senior", value: "SEMI SENIOR", color: "bg-yellow-500 text-white font-semibold" },
  { label: "Junior", value: "JUNIOR", color: "bg-red-500 text-white font-semibold" },
  { label: "PLAN DE MEJORA", value: "PLAN DE MEJORA", color: "bg-gray-400 text-white font-semibold" }
];

export default function Vendedores() {
  const { data, loading, error } = useFetchVendedores();
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");

  const vendedoresFiltrados = data.filter((v) =>
    v.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoriaFilter === "" || v.categoria === categoriaFilter)
  );

  if (loading) return <div className="text-center p-4">Cargando datos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold text-center">Dashboard de Vendedores</h1>

      <CategoriasTable />

      <section>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <h2 className="text-2xl font-bold">Vendedores</h2>
          <input
            type="text"
            placeholder="Buscar vendedor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-[400px] border border-gray-300 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex items-center flex-wrap gap-2">
            {TAGS.map((tag) => (
              <button
                key={tag.value}
                onClick={() => setCategoriaFilter(tag.value)}
                className={`px-4 py-2 text-sm rounded-full border transition-all duration-200 hover:cursor-pointer
                  ${categoriaFilter === tag.value
                    ? tag.color || "bg-blue-500 text-white"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </div>

        <LayoutGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14">
            <AnimatePresence>
              {vendedoresFiltrados.map((v) => (
                <motion.div
                  key={v.vendedor}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <VendedorCard
                    vendedor={v}
                    searchTerm={searchTerm}
                    onOpenModal={setModal}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </section>

      <DetalleModal vendedor={modal} onClose={() => setModal(null)} />
    </div>
  );
}
