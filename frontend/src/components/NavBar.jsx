import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { Bell, Settings, User } from "lucide-react";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState("");
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePerfilClick = () => {
    navigate("/perfil");
  };

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
          {/* Logo */}
          <Link to="/panel" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          {/* Links centrales */}
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

          {/* Acciones lado derecho */}
          <div className="flex items-center space-x-4">
            <div className="relative" id="notificationWrapper">
              <button
                onClick={toggleNotificaciones}
                className="text-white hover:text-blue-200 transition-colors p-1 rounded-full hover:bg-blue-800"
                aria-label="Notificaciones"
              >
                <Bell size={20} />
              </button>

              {notificacionesAbiertas && (
                <div className="absolute right-0 mt-2 w-72 bg-white text-black rounded-md shadow-xl z-50 border border-gray-200">
                  <div className="p-4 font-semibold border-b text-gray-700">🔔 Notificaciones</div>
                  <ul className="max-h-64 overflow-y-auto divide-y text-sm">
                    <li className="p-3 hover:bg-gray-100">No hay nuevas notificaciones.</li>
                    {/* Aquí puedes mapear notificaciones reales */}
                    {/* <li className="p-3 hover:bg-gray-100">Nueva entrada de ganado registrada.</li> */}
                  </ul>
                  <div className="text-center text-blue-600 text-sm py-2 hover:underline cursor-pointer">
                    Ver todas
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handlePerfilClick}
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

      {/* Margen inferior para el contenido */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
