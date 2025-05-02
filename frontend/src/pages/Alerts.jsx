import Navbar from "../components/NavBar";

const Alerts = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Página de Ganado</h1>



        <section>
          <h2 className="text-xl font-semibold mb-2">⚠️ Alertas de discrepancia</h2>
          <p className="text-sm text-gray-700">Consulta las alertas generadas por discrepancias en el conteo o movimiento del ganado.</p>
        </section>


      </div>
    </div>
  );
};

export default Alerts;
