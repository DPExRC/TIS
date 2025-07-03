import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Bell, User, Menu } from "lucide-react";
import Notificaciones from "../components/Notifications";
import logo from "../assets/logo.png";

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState("");
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [cargandoAlertas, setCargandoAlertas] = useState(true);
  const [errorAlertas, setErrorAlertas] = useState(null);

  // Efecto para obtener el usuario actual
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUsername(user.displayName || user.email);
    });
    return () => unsubscribe();
  }, [auth]);

  // Efecto para cargar las alertas
  useEffect(() => {
    const fetchAlertas = async () => {
      setCargandoAlertas(true);
      try {
        const res = await fetch("http://localhost:8000/alertas/list/");
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        const data = await res.json();
        setAlertas(data);
      } catch (error) {
        setErrorAlertas(error.message);
        setAlertas([]);
      } finally {
        setCargandoAlertas(false);
      }
    };
    fetchAlertas();
  }, []);

  // Toggle para mostrar/ocultar notificaciones
  const toggleNotificaciones = () => setNotificacionesAbiertas((prev) => !prev);

  // Cerrar notificaciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest("#notificationWrapper")) {
        setNotificacionesAbiertas(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Calcular cantidad de alertas para el badge
  const cantidadAlertas = alertas.length;
  const textoBadge = cantidadAlertas > 4 ? "4+" : cantidadAlertas.toString();

  return (
    <>
      {/* Barra de navegación principal */}
      <nav className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Botón hamburguesa (solo visible en móvil) */}
          <button
            onClick={toggleSidebar}
            className="md:hidden text-white mr-4 p-1 rounded hover:bg-blue-800"
            aria-label="Abrir menú lateral"
          >
            <Menu size={24} />
          </button>

          {/* Logo de la aplicación */}
          <Link to="/panel" className="fflex items-center space-x-2 flex-shrink-0 min-w-[120px]">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>



          {/* Sección de iconos (notificaciones y perfil) */}
          <div className="flex items-center space-x-4">
            {/* Contenedor de notificaciones */}
            <div className="relative" id="notificationWrapper">
              <button
                onClick={toggleNotificaciones}
                className="relative text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-800"
                aria-label="Notificaciones"
              >
                <Bell size={20} />
                {/* Badge de notificaciones no leídas */}
                {cantidadAlertas > 0 && (
                  <span
                    className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full select-none"
                    style={{ minWidth: "18px", height: "18px" }}
                  >
                    {textoBadge}
                  </span>
                )}
              </button>
              {/* Componente de notificaciones desplegable */}
              <Notificaciones abiertas={notificacionesAbiertas} />
            </div>

            {/* Botón de perfil de usuario */}
            <button
              onClick={() => navigate("/perfil")}
              className="flex items-center space-x-2 text-white hover:text-blue-200 focus:outline-none transition-colors p-1 rounded-full hover:bg-blue-800 font-medium"
              aria-label="Ir al perfil"
            >
              <User size={20} />
              <span className="hidden md:inline">{username}</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Espacio para compensar la altura fija del navbar */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;