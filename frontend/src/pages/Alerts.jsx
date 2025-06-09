import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";

const Alerts = () => {
  return (
    <div>
      <Sidebar />

      <div className="ml-50">
        <Navbar />

        <div className="ml-0 bg-gradient-to-r from-blue-400 to-blue-700 text-white py-12 shadow-md">
          <div className="px-6">
            <h1 className="text-2xl font-semibold">Alertas de discrepancia</h1>
          </div>
        </div>

        <main className="p-6 space-y-6">
          <section>
            <p className="text-sm text-gray-700">
              Consulta las alertas generadas por discrepancias en el conteo o movimiento del ganado.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Alerts;
