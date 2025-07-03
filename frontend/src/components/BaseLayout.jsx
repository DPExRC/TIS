import { useState } from "react";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";

const BaseLayout = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar responsivo */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 w-full md:ml-64">
        {/* Navbar con botón para toggle del sidebar */}
        <Navbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Cabecera con título */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white py-8 px-2 md:px-8 shadow-md">
          <h1 className="text-lg md:text-xl font-semibold">{title}</h1>
        </div>

        {/* Contenido de la página */}
        <div className="p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
};

export default BaseLayout;