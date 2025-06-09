// Notificaciones.jsx
import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";

const Notificaciones = ({ alertas }) => {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef();

  const toggle = () => setAbierto(!abierto);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const severidadEstilo = {
    baja: "bg-green-100 border-green-500 text-green-700",
    media: "bg-yellow-100 border-yellow-500 text-yellow-700",
    alta: "bg-red-100 border-red-500 text-red-700",
  };

  return (
    <div className="relative" ref={ref}>
      {/* Icono de campana con contador */}
      <button
        onClick={toggle}
        className="relative text-white hover:text-blue-200 p-1 rounded-full hover:bg-blue-800 transition"
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {alertas.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {alertas.length}
          </span>
        )}
      </button>

      {/* Panel desplegable */}
      {abierto && (
        <div className="absolute right-0 mt-2 w-96 max-h-[70vh] overflow-y-auto bg-white border rounded-lg shadow-lg z-50">
          <div className="p-4 border-b text-blue-700 font-semibold">
            Alertas de discrepancia ({alertas.length})
          </div>
          <div className="divide-y">
            {alertas.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No hay alertas activas.</p>
            ) : (
              alertas.map((alerta) => (
                <div
                  key={alerta.id}
                  className={`p-4 text-sm border-l-4 ${severidadEstilo[alerta.severidad]} relative`}
                >
                  <div className="font-bold">{alerta.titulo}</div>
                  <div className="text-gray-600 whitespace-pre-line">{alerta.descripcion}</div>
                  <div className="text-xs text-gray-400 mt-1">{alerta.fecha}</div>
                  <div className="absolute top-2 right-2 text-xs font-semibold uppercase">
                    {alerta.severidad}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notificaciones;
