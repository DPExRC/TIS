import React, { useEffect, useState } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";

const Actual = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistros = async () => {
      try {
        const res = await axios.get("http://localhost:8000/existencia/crear/");
        // Orden descendente por fecha_creacion
        const ordenados = res.data.sort((a, b) =>
          new Date(b.fecha_creacion) - new Date(a.fecha_creacion)
        );
        setRegistros(ordenados);
      } catch (err) {
        setError("Error cargando registros.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistros();
  }, []);

  // Función auxiliar para formatear fecha legible
  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return "-";
    const d = new Date(fechaStr);
    return d.toLocaleString();
  };

  // Renderizar la lista de registros agrupados o secuenciales
  return (
    <BaseLayout title={"Actual"}>
      <div className="max-w-4xl mx-auto p-6">

        {loading && (
          <div className="text-center text-gray-600">Cargando registros...</div>
        )}

        {error && (
          <div className="text-center text-red-600 font-semibold">{error}</div>
        )}

        {!loading && !error && registros.length === 0 && (
          <div className="text-center text-gray-500">No hay registros disponibles.</div>
        )}

        {!loading && !error && registros.length > 0 && (
          <ul className="space-y-4">
            {registros.map((reg) => {
              const tipo = reg.tipo || "Sin especificar";
              return (
                <li
                  key={reg.id}
                  className={`border rounded p-4 shadow-sm ${
                    tipo === "ingreso"
                      ? "bg-green-50 border-green-400"
                      : tipo === "egreso"
                      ? "bg-red-50 border-red-400"
                      : "bg-gray-50 border-gray-300"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-lg">
                      Tipo:{" "}
                      <span
                        className={`capitalize ${
                          tipo === "ingreso"
                            ? "text-green-700"
                            : tipo === "egreso"
                            ? "text-red-700"
                            : "text-gray-700"
                        }`}
                      >
                        {tipo}
                      </span>
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatearFecha(reg.fecha_creacion)}
                    </span>
                  </div>

                  <p>
                    <strong>Zona:</strong> {reg.zona || "-"}
                  </p>
                  <p>
                    <strong>Horario:</strong> {reg.horario || "-"}
                  </p>
                  <p>
                    <strong>Días:</strong> {reg.dias ? reg.dias.join(", ") : "-"}
                  </p>
                  <p>
                    <strong>Responsable:</strong> {reg.responsable || "-"}
                  </p>

                  <p>
                    <strong>Códigos válidos:</strong>{" "}
                    {reg.codigos_validos ? reg.codigos_validos.join(", ") : "-"}
                  </p>
                  <p>
                    <strong>Códigos escaneados:</strong>{" "}
                    {reg.codigos_escaneados ? reg.codigos_escaneados.join(", ") : "-"}
                  </p>
                  <p>
                    <strong>Códigos faltantes:</strong>{" "}
                    {reg.codigos_faltantes ? reg.codigos_faltantes.join(", ") : "-"}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </BaseLayout>
  );
};

export default Actual;
