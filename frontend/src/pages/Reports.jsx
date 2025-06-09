import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import { Button } from "../components/Button";
import { Menu } from "lucide-react";
import { useState } from "react";

const Reports = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar - Mismo estilo que en Dashboard y Cattle */}
      <div 
        className={`transition-all duration-300 ease-in-out 
          ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}
      >
        <Sidebar />
      </div>

      {/* Main Content - Estructura consistente */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        
        {/* Botón para móvil - Igual que en otros componentes */}
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-blue-800 text-white"
        >
          <Menu size={20} />
        </button>

        {/* Contenido principal */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-xl w-full">
              {/* Tarjeta 1 - Estilo consistente */}
              <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-xl font-semibold mb-2">📈 Visualización histórica</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Explora registros históricos de conteo, movimiento y presencia de animales.
                </p>
                <Button onClick={() => navigate("/reportes/historico")}>
                  Ver Histórico
                </Button>
              </div>

              {/* Tarjeta 2 */}
              <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-xl font-semibold mb-2">📊 Exportar datos</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Genera y descarga reportes en diferentes formatos.
                </p>
                <Button onClick={() => navigate("/reportes/exportar")}>
                  Exportar Datos
                </Button>
              </div>

              {/* Tarjeta 3 - Puedes agregar más tarjetas según necesites */}
              <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-xl font-semibold mb-2">📑 Reportes personalizados</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Crea reportes con filtros y parámetros específicos.
                </p>
                <Button onClick={() => navigate("/reportes/personalizados")}>
                  Crear Reporte
                </Button>
              </div>

              {/* Tarjeta 4 */}
              <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
                <h2 className="text-xl font-semibold mb-2">🔍 Análisis detallado</h2>
                <p className="text-sm text-gray-700 mb-4">
                  Accede a análisis avanzados de los datos registrados.
                </p>
                <Button onClick={() => navigate("/reportes/analisis")}>
                  Ver Análisis
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;