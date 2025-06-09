import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { Bell, User } from "lucide-react";
import axios from "axios";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState("");
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [alertas, setAlertas] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Carga las alertas con la misma lógica que en Alerts.jsx
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/comparar/").then((res) => {
      const data = res.data;
      const alertasGeneradas = [];

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

              alertasGeneradas.push({
                id: id++,
                titulo: `Discrepancia en ${zona} - ${tipo}`,
                descripcion,
                fecha: new Date().toISOString().split("T")[0],
                severidad,
              });
            }
          }
        }
      }
      setAlertas(alertasGeneradas);
    });
  }, []);

  const toggleNotificaciones = () => {
    setNotificacionesAbiertas((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#notificationWrapper")) {
        setNotificacionesAbiertas(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/panel" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link
              to="/ganado"
              className="text-white hover:text-blue-200 font-medium transition-all duration-200 hover:scale-105"
            >
              Ganado
            </Link>
            <Link
              to="/reportes"
              className="text-white hover:text-blue-200 font-medium transition-all duration-200 hover:scale-105"
            >
              Reportes
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" id="notificationWrapper">
              <button
                onClick={toggleNotificaciones}
                className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-800"
                aria-label="Notificaciones"
              >
                <Bell size={20} />
                {alertas.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {alertas.length}
                  </span>
                )}
              </button>

              {notificacionesAbiertas && (
                <div className="absolute right-0 mt-2 w-96 max-h-64 overflow-y-auto bg-white text-black rounded-md shadow-xl z-50 border border-gray-200">
                  <div className="p-4 font-semibold border-b text-gray-700 flex justify-between items-center">
                    <span>🔔 Notificaciones</span>
                    <span className="text-sm text-gray-500">{alertas.length} alertas</span>
                  </div>
                  <ul className="divide-y text-sm">
                    {alertas.length === 0 ? (
                      <li className="p-3 text-gray-500">No hay nuevas notificaciones.</li>
                    ) : (
                      alertas.map(({ id, titulo, descripcion, fecha, severidad }) => (
                        <li key={id} className="p-3 hover:bg-gray-100">
                          <strong>{titulo}</strong>
                          <p className="whitespace-pre-line text-gray-700 text-xs mt-1">{descripcion}</p>
                          <p className="text-gray-400 text-xs mt-1">{fecha}</p>
                          <span
                            className={`inline-block mt-1 px-2 py-0.5 rounded text-white text-xs ${
                              severidad === "alta"
                                ? "bg-red-600"
                                : severidad === "media"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          >
                            {severidad.toUpperCase()}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                  <Link 
                    to="/alertas"
                    className="block text-center text-blue-600 text-sm py-2 hover:underline cursor-pointer"
                  >
                    Ver todas
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center space-x-2 text-white hover:text-blue-200 focus:outline-none transition-colors p-1 rounded-full hover:bg-blue-800 font-medium"
              aria-label="Ir al perfil"
              title="Ir al perfil"
            >
              <User size={20} />
              <span className="hidden md:inline">{username}</span>
            </button>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
};

export default Navbar;
