import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "../styles/NavBar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768); // Ejemplo: móvil <768px

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email;
        setUsername(name);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    // Listener para cambiar isMobile cuando se redimensiona ventana
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/");
  };

  const handlePerfilClick = () => {
    navigate('/perfil');
  };

  const toggleDropdown = () => {
    setDropdownOpen(prev => !prev);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md z-50">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/panel">
            <img src={logo} alt="Mi app" className="h-15" />
          </Link>

          {/* Items centrados */}
          <div className="flex-grow flex justify-center space-x-8">
            <Link to="/ganado" className="text-white ">Ganado</Link>
            <Link to="/reportes" className="text-white ">Reportes</Link>
          </div>

          {/* Botón hamburguesa o username según tamaño */}
          <div className="relative">
            <button
              id={isMobile ? "HamburgerDropdown" : "UsernameDropdown"}
              onClick={toggleDropdown}
              className={`p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 flex items-center ${
                isMobile ? "text-white" : "text-black"
              }`}
              aria-label="Menú"
              aria-expanded={dropdownOpen}
            >
              {isMobile ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <span>{username}</span>
              )}
            </button>


            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-md shadow-lg z-50">
                <button
                  id="PerfilButton"
                  onClick={handlePerfilClick}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-black"
                >
                  Ver perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Espacio inferior para separar del contenido */}
      <div className="h-20"></div>
    </>
  );
};

export default Navbar;
