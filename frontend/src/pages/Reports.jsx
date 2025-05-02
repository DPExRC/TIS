import Navbar from "../components/NavBar";
import { Button } from "../components/Button";

const Reports = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6">

        <div className="flex justify-center w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-xl w-full">
            {/* Tarjeta 1 */}
            <div className="w-full p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">📈 Visualización histórica</h2>
              <p className="text-sm text-gray-700 mb-4">
              Explora registros históricos de conteo, movimiento y presencia de animales.</p>
              <Button onClick={() => navigate("/#")}>
                Ir a Registro de Animales
              </Button>
            </div>

            {/* Tarjeta 2 */}
            <div className="w-full p-4 border rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold mb-2">📊 Exportar datos</h2>
              <p className="text-sm text-gray-700 mb-4">
                Visualiza el conteo diario y verifica la presencia de los animales.
              </p>
              <Button onClick={() => navigate("/#")}>
                Ir a Conteo y Presencia
              </Button>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  );
};


export default Reports;
