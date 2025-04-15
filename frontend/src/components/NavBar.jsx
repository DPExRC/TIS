import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import "../styles/NavBar.css";
import logo from "../assets/logo.png"; // Asegúrate de que la ruta sea correcta


const Navbar = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-blue-600 p-4 shadow-md z-50 ">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/dashboard">
         <img src={logo} alt="Mi app" className="h-15"></img> 
        </Link>

        {/* Items centrados */}
        <div className="flex-grow flex justify-center space-x-8">
          <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
          <Link to="/about" className="text-white hover:underline">Acerca de</Link>
          <Link to="/services" className="text-white hover:underline">Servicios</Link>
        </div>

        {/* Perfil + Cierre de sesión */}
        <div className="flex items-center space-x-8">
        <Link to="/profile" className="text-white hover:underline">👤 Perfil </Link>
          <button onClick={handleLogout} className="text-white hover:underline">
            Cerrar sesión
          </button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
