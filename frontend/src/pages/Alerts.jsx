import { useEffect, useState, useRef } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";
import {
  HelpCircle, Ban, AlertTriangle, Info,
  CheckCircle, Check, Minus, X
} from "lucide-react";

const Alerts = () => {
  const [agrupados, setAgrupados] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const enviadosIngreso = useRef(new Set());
  const enviadosEgreso = useRef(new Set());

  useEffect(() => {
    axios.get("http://localhost:8000/existencia/crear/")
      .then((res) => {
        const agrup = {};
        res.data.forEach((r) => {
          if (!agrup[r.codigo_asignacion]) agrup[r.codigo_asignacion] = [];
          agrup[r.codigo_asignacion].push(r);
        });
        setAgrupados(agrup);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al cargar alertas");
      })
      .finally(() => setLoading(false));
  }, []);

  const compararFaltantes = (validos = [], escaneados = []) => {
    const escaneadosSet = new Set(escaneados);
    return validos.filter((c) => !escaneadosSet.has(c));
  };

  const formatear = (arr) => (arr && arr.length > 0 ? arr.join(", ") : "—");

  const obtenerColor = (ingreso, egreso, faltantesIngreso, faltantesEgreso) => {
    if (!ingreso || !egreso) return "bg-yellow-100 border-yellow-400";
    if (faltantesIngreso.length > 0 || faltantesEgreso.length > 0)
      return "bg-red-100 border-red-400";
    return "bg-green-100 border-green-400";
  };

  const getIconStatus = (registro) => {
    const validos = registro?.codigos_validos || [];
    const escaneados = registro?.codigos_escaneados || [];

    if (escaneados.length === 0)
      return { icon: <HelpCircle className="text-gray-500 w-5 h-5" />, label: "Sin escaneos" };

    const escaneadosSet = new Set(escaneados);
    const validosSet = new Set(validos);

    const escaneadosValidos = escaneados.filter((c) => validosSet.has(c));
    const faltantes = validos.filter((c) => !escaneadosSet.has(c));

    if (escaneadosValidos.length === 0)
      return { icon: <Ban className="text-red-600 w-5 h-5" />, label: "Ningún código válido" };

    if (faltantes.length > 0)
      return { icon: <AlertTriangle className="text-yellow-500 w-5 h-5" />, label: "Códigos faltantes" };

    if (escaneados.length > validos.length)
      return { icon: <Info className="text-blue-500 w-5 h-5" />, label: "Códigos de más" };

    return { icon: <CheckCircle className="text-green-600 w-5 h-5" />, label: "Correcto" };
  };

  const renderBotonesEstado = () => (
    <div className="flex gap-2 mt-2">
      <button className="flex items-center gap-1 px-2 py-1 rounded bg-green-200 text-green-800 text-xs hover:bg-green-300">
        <Check className="w-4 h-4" />
      </button>
      <button className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs hover:bg-yellow-300">
        <Minus className="w-4 h-4" />
      </button>
      <button className="flex items-center gap-1 px-2 py-1 rounded bg-red-200 text-red-800 text-xs hover:bg-red-300">
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <BaseLayout title="Alertas">
      <div className="max-w-6xl mx-auto p-6">
        {loading && <p>Cargando...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading &&
          !error &&
          Object.entries(agrupados).map(([codigo, registros]) => {
            const ingreso = registros.find((r) => r.tipo === "ingreso");
            const egreso = registros.find((r) => r.tipo === "egreso");

            const faltantesIngreso = ingreso
              ? compararFaltantes(ingreso.codigos_validos, ingreso.codigos_escaneados)
              : [];
            const faltantesEgreso = egreso
              ? compararFaltantes(egreso.codigos_validos, egreso.codigos_escaneados)
              : [];

            const sobrantesIngreso = ingreso?.codigos_escaneados?.filter(
              (c) => !new Set(ingreso.codigos_validos || []).has(c)
            ) || [];

            const sobrantesEgreso = egreso?.codigos_escaneados?.filter(
              (c) => !new Set(egreso.codigos_validos || []).has(c)
            ) || [];

            const colorClase = obtenerColor(ingreso, egreso, faltantesIngreso, faltantesEgreso);

            return (
              <div key={codigo} className={`border ${colorClase} rounded-lg p-4 mb-6 shadow-sm`}>
                {/* Cabecera principal: Asignación + datos importantes */}
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-blue-900">Código Asignación: {codigo}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 mt-2 text-sm">
                    <p><strong>Zona:</strong> {ingreso?.zona || egreso?.zona }</p>
                    <p><strong>Horario:</strong> {ingreso?.horario || egreso?.horario}</p>
                    <p><strong>Días:</strong> {formatear(ingreso?.dias || egreso?.dias)}</p>
                    <p><strong>Responsable:</strong> {ingreso?.responsable || egreso?.responsable}</p>
                  </div>
                </div>

                {/* Cuerpo con ingreso y egreso */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* INGRESO */}
                  <div className="border rounded-md bg-white p-4 shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-green-700">Ingreso</h4>
                      {ingreso && (
                        <span className="flex items-center gap-1 text-sm">
                          {getIconStatus(ingreso).icon}
                          {getIconStatus(ingreso).label}
                        </span>
                      )}
                    </div>
                    {ingreso ? (
                      <>
                        <p><strong>Fecha:</strong> {new Date(ingreso.fecha_creacion).toLocaleString()}</p>
                        <p><strong>Códigos válidos:</strong> {formatear(ingreso.codigos_validos)}</p>
                        <p><strong>Códigos escaneados:</strong> {formatear(ingreso.codigos_escaneados)}</p>
                        <p><strong>Códigos faltantes:</strong> {formatear(faltantesIngreso)}</p>
                        <p><strong>Códigos sobrantes:</strong> {formatear(sobrantesIngreso)}</p>
                        {getIconStatus(ingreso).label !== "Correcto" && renderBotonesEstado()}
                      </>
                    ) : (
                      <p className="italic text-gray-600">No hay datos de ingreso.</p>
                    )}
                  </div>

                  {/* EGRESO */}
                  <div className="border rounded-md bg-white p-4 shadow">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-red-700">Egreso</h4>
                      {egreso && (
                        <span className="flex items-center gap-1 text-sm">
                          {getIconStatus(egreso).icon}
                          {getIconStatus(egreso).label}
                        </span>
                      )}
                    </div>
                    {egreso ? (
                      <>
                        <p><strong>Fecha:</strong> {new Date(egreso.fecha_creacion).toLocaleString()}</p>
                        <p><strong>Códigos válidos:</strong> {formatear(egreso.codigos_validos)}</p>
                        <p><strong>Códigos escaneados:</strong> {formatear(egreso.codigos_escaneados)}</p>
                        <p><strong>Códigos faltantes:</strong> {formatear(faltantesEgreso)}</p>
                        <p><strong>Códigos sobrantes:</strong> {formatear(sobrantesEgreso)}</p>
                        {getIconStatus(egreso).label !== "Correcto" && renderBotonesEstado()}
                      </>
                    ) : (
                      <p className="italic text-gray-600">No hay datos de egreso.</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </BaseLayout>
  );
};

export default Alerts;
