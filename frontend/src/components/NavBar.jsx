import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import "../styles/NavBar.css";
import logo from "../assets/logo.png";

const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [username, setUsername] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false); // Estado para controlar el menú desplegable

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const name = user.displayName || user.email;
        setUsername(name);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/panel">
          <img src={logo} alt="Mi app" className="h-15" />
        </Link>

        {/* Items centrados */}
        <div className="flex-grow flex justify-center space-x-8">
          <Link to="/ganado" className="text-white hover:underline">Ganado</Link>
          <Link to="/reportes" className="text-white hover:underline">Reportes</Link>
        </div>

        {/* Usuario y menú desplegable */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="text-black hover:underline focus:outline-none"
          >
            {username}
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-black text-black  rounded-md">
              <Link 
              to="/perfil" 
              className="block px-4 py-2 hover:bg-gray-100 text-black"
              >
                Ver perfil
                </Link>
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
  );
};

export default Navbar;
