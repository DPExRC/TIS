import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle, AlertTriangle, Ban, HelpCircle, Info
} from "lucide-react";

const Notificaciones = ({ abiertas }) => {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Determina icono según datos de la alerta
  const getEstadoIcon = (a) => {
    if (!a?.codigos_escaneados?.length) {
      return { icon: <HelpCircle className="text-gray-500 w-4 h-4" />, label: "Sin escaneos" };
    }
    if (a?.codigos_faltantes?.length > 0) {
      return { icon: <AlertTriangle className="text-yellow-500 w-4 h-4" />, label: "Faltantes" };
    }
    if (a?.codigos_sobrantes?.length > 0) {
      return { icon: <Info className="text-blue-500 w-4 h-4" />, label: "Sobrantes" };
    }
    if (a?.codigos_escaneados.length > 0) {
      return { icon: <CheckCircle className="text-green-600 w-4 h-4" />, label: "Correcto" };
    }
    return { icon: <Ban className="text-red-600 w-4 h-4" />, label: "Ninguno válido" };
  };

  useEffect(() => {
    const obtenerAlertas = async () => {
      setCargando(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/alertas/list/");
        if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
        const data = await response.json();

        const agrupadas = {};
        data.forEach((a) => {
          if (!a?.codigo_asignacion || !a?.tipo) return;
          const key = a.codigo_asignacion;
          if (!agrupadas[key]) agrupadas[key] = {};
          agrupadas[key][a.tipo] = a;
        });

        const filtradas = Object.values(agrupadas)
          .flatMap((grupo) => Object.values(grupo))
          .filter((a) => a && a.tipo && a.zona)
          .sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));

        setAlertas(filtradas);
      } catch (err) {
        setError(err.message);
        setAlertas([]);
      } finally {
        setCargando(false);
      }
    };

    if (abiertas) obtenerAlertas();
  }, [abiertas]);

  if (!abiertas) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white text-black rounded-md shadow-xl z-50 border border-gray-200">
      {/* Encabezado */}
      <div className="sticky top-0 bg-white z-10 border-b px-4 py-3 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">
          {cargando ? "Cargando..." : `${alertas.length} alerta(s)`}
        </span>
        <Link to="/alertas" className="text-sm text-blue-600 font-semibold hover:underline">
          Ver todas
        </Link>
      </div>

      {/* Lista de alertas */}
      <ul className="max-h-72 overflow-y-auto divide-y text-sm">
        {error && <li className="p-3 text-red-600 font-semibold">Error al cargar: {error}</li>}
        {cargando && !error && <li className="p-3 text-gray-500">Cargando notificaciones...</li>}
        {!cargando && !error && alertas.length === 0 && (
          <li className="p-3 text-gray-500">No hay nuevas notificaciones.</li>
        )}
        {!cargando && !error && alertas.length > 0 && alertas.slice(0, 5).map((a) => {
          const estado = getEstadoIcon(a);
          return (
            <li key={a.id || Math.random()} className="p-3 text-gray-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-blue-900 mb-1">
                {estado.icon}
                <span>{a.tipo?.toUpperCase() || "Sin tipo"} - {a.zona || "Sin zona"} - {a.codigo_asignacion || "Sin código"}</span>
              </div>
              <div className="pl-5 text-xs space-y-1">
                <div><strong className="text-gray-700">Horario:</strong> <span className="text-black">{a.horario}</span></div>
                <div><strong className="text-gray-700">Días:</strong> {Array.isArray(a?.dias) ? a.dias.join(", ") : "—"}</div>
                <div><strong className="text-gray-700">Responsable:</strong> {a.responsable}</div>
                <div><strong className="text-gray-700">Finalización:</strong> {a.hora_finalizacion ? new Date(a.hora_finalizacion).toLocaleString() : "—"}</div>
                {Array.isArray(a?.codigos_sobrantes) && a.codigos_sobrantes.length > 0 && (
                  <div className="text-blue-700 font-semibold">Sobrantes: {a.codigos_sobrantes.join(", ")}</div>
                )}
                {Array.isArray(a?.codigos_faltantes) && a.codigos_faltantes.length > 0 && (
                  <div className="text-yellow-700 font-semibold">Faltantes: {a.codigos_faltantes.join(", ")}</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Notificaciones;
