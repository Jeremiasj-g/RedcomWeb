import { useState } from "react";
import { useFetchVendedores } from "../../Hooks/useFetchVendedores";
import VendedorCard from "./VendedorCard";
import DetalleModal from "./DetalleModal";
import CategoriasTable from "../CategoriasTable";
import { AnimatePresence, motion, LayoutGroup } from "framer-motion";

export default function Vendedores() {
  const { data, loading, error } = useFetchVendedores();
  const [modal, setModal] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const vendedoresFiltrados = data.filter((v) =>
    v.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center p-4">Cargando datos...</div>;
  if (error) return <div className="text-center p-4 text-red-500">{error}</div>;

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto space-y-12">
      <h1 className="text-3xl font-bold text-center">Dashboard de Vendedores</h1>

      <CategoriasTable />

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

        <LayoutGroup>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-14">
            <AnimatePresence>
              {vendedoresFiltrados.map((v) => (
                <motion.div
                  key={v.vendedor}
                  layout
/*                   initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }} */
                  transition={{ duration: 0.17 }}
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
