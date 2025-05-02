import { useNavigate } from "react-router-dom";
import Navbar from "../components/NavBar";
import { Button } from "../components/Button";

const Cattle = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="p-6">

        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-xl w-full">
            {/* Tarjeta 1 */}
            <div className="w-full p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">📋 Registro de animales</h2>
              <p className="text-sm text-gray-700 mb-4">
                Visualiza el conteo diario y verifica la presencia de los animales.
              </p>
              <Button onClick={() => navigate("/registroanimales")}>
                Ir a Registro de Animales
              </Button>
            </div>

            {/* Tarjeta 2 */}
            <div className="w-full p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">📊 Conteo y presencia</h2>
              <p className="text-sm text-gray-700 mb-4">
                Visualiza el conteo diario y verifica la presencia de los animales.
              </p>
              <Button onClick={() => navigate("/conteoypresencia")}>
                Ir a Conteo y Presencia
              </Button>
            </div>

            {/* Tarjeta 3 */}
            <div className="w-full p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">⚠️ Alertas de discrepancia</h2>
              <p className="text-sm text-gray-700 mb-4">
                Consulta las alertas generadas por discrepancias en el conteo o movimiento del ganado.
              </p>
              <Button onClick={() => navigate("/alertas")}>
                Ver Alertas
              </Button>
            </div>

            {/* Tarjeta 4 */}
            <div className="w-full p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">📦 Total de animales</h2>
              <p className="text-sm text-gray-700 mb-4">
                Totalidad de animales en BD
              </p>
              <Button onClick={() => navigate("/totalanimales")}>
                Ver Total
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cattle;