// Alerts.jsx (Componente principal)
import React, { useState, useEffect } from "react";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import axios from "axios";
import Notificaciones from "../components/Notifications"; // Ajusta ruta según ubicación

const getAlertaEstilo = (severidad) => {
  switch (severidad) {
    case "alta":
      return {
        color: "red-600",
        border: "border-red-600",
        bgLabel: "bg-red-600",
        label: "ALTA",
        icon: <AlertTriangle className="text-red-600 mt-1" />,
      };
    case "media":
      return {
        color: "yellow-500",
        border: "border-yellow-500",
        bgLabel: "bg-yellow-500",
        label: "MEDIA",
        icon: <AlertCircle className="text-yellow-500 mt-1" />,
      };
    case "baja":
    default:
      return {
        color: "blue-500",
        border: "border-blue-500",
        bgLabel: "bg-blue-500",
        label: "BAJA",
        icon: <Info className="text-blue-500 mt-1" />,
      };
  }
};

const analizarDiscrepancias = (data) => {
  const alertas = [];
  let id = 1;

  for (const zona in data) {
    for (const especie in data[zona]) {
      for (const tipo in data[zona][especie]) {
        const registro = data[zona][especie][tipo];
        if (!registro.misma_cantidad || !registro.mismos_codigos) {
          const severidad =
            registro.total_anterior === 0 || registro.total_actual === 0
              ? "alta"
              : "media";

          const descripcion = `Anteriores ${registro.total_anterior}, actuales ${registro.total_actual}.\nNuevos: ${registro.diferencias.nuevos.join(
            ", "
          )}.\nFaltantes: ${registro.diferencias.faltantes.join(", ")}`;

          alertas.push({
            id: id++,
            titulo: `Discrepancia en ${zona} - ${tipo}`,
            descripcion,
            fecha: new Date().toISOString().split("T")[0],
            severidad,
            resuelta: false,
          });
        }
      }
    }
  }

  return alertas;
};

const Alerts = () => {
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/comparar/").then((res) => {
      const alertasGeneradas = analizarDiscrepancias(res.data);
      setAlertas(alertasGeneradas);
    });
  }, []);

  const toggleResuelta = (id) => {
    setAlertas((prev) =>
      prev.map((alerta) =>
        alerta.id === id ? { ...alerta, resuelta: !alerta.resuelta } : alerta
      )
    );
  };

  return (
    <div>
      <Sidebar />
      <div className="ml-50">
        <Navbar />
        <div className="ml-0 bg-gradient-to-r from-blue-400 to-blue-700 text-white py-12 shadow-md flex justify-between items-center px-6">
          <h1 className="text-2xl font-semibold">Alertas de discrepancia</h1>
        </div>
        <main className="p-6 space-y-6">
          <section className="flex justify-center">
            <div className="w-1/2 space-y-4">
              {alertas.map((alerta) => {
                const estilo = getAlertaEstilo(alerta.severidad);
                return (
                  <div
                    key={alerta.id}
                    className={`relative bg-white rounded-xl shadow-md p-5 flex items-start space-x-4 border-l-4 ${estilo.border} ${
                      alerta.resuelta ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={alerta.resuelta}
                      onChange={() => toggleResuelta(alerta.id)}
                      className="mt-2 cursor-pointer"
                    />
                    {estilo.icon}
                    <div>
                      <h2
                        className={`text-lg font-semibold text-gray-800 ${
                          alerta.resuelta ? "line-through" : ""
                        }`}
                      >
                        {alerta.titulo}
                      </h2>
                      <p
                        className={`text-gray-600 whitespace-pre-line ${
                          alerta.resuelta ? "line-through" : ""
                        }`}
                      >
                        {alerta.descripcion}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{alerta.fecha}</p>
                    </div>
                    <div
                      className={`absolute bottom-2 right-2 px-2 py-1 text-xs text-white font-bold rounded ${estilo.bgLabel}`}
                    >
                      {estilo.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Alerts;
