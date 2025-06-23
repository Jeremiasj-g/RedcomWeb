import { useState } from 'react'
import './App.css'
import './index.css'

import Header from './Components/Header'

import Vendedores from "./Components/Vendedores/index";
import Supervisores from "./Components/Supervisores";
import Sidebar from "./Components/Sidebar";

export default function App() {
  const [view, setView] = useState("vendedores");

  return (
    <>
      <Header />

      <div className="flex min-h-screen">
        <Sidebar setView={setView} view={view} />

        <div className="flex-1">
          <main className="p-4">
            {view === "vendedores" && <Vendedores />}
            {view === "supervisores" && <Supervisores />}
          </main>
        </div>
      </div>
    </>
  );
}