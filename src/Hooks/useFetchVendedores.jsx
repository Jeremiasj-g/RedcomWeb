import { useEffect, useState } from "react";
import { ESCALAS, RANGO_NIVELES, EXCEPCIONES } from "../utils/constants";
import { determinarCategoria } from "../utils/determinarCategoria";

export function useFetchVendedores() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch("https://sheetdb.io/api/v1/iw7jk5cdt796c");
                const generalRes = await res.json();

                const parsed = generalRes.map((v) => {
                    const nombreBase = v.vendedor.replace(/^\d+\\s/, "").trim().toUpperCase();
                    v.vendedor = v.vendedor.trim().toUpperCase();

                    const resultado = determinarCategoria(ESCALAS, RANGO_NIVELES, EXCEPCIONES, v);

                    return {
                        ...v,
                        facturacion: parseFloat(v.facturacion.replace(/[$,]/g, "")),
                        eficiencia: parseFloat(v.eficiencia.replace("%", "")),
                        vendedor_nombre: nombreBase,
                        categoria: resultado.categoria,
                        detalle: resultado.detalle
                    };
                });

                setData(parsed);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { data, loading, error };
}
