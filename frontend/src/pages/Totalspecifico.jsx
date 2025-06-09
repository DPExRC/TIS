import Navbar from "../components/NavBar";
import CoutingPresenceTable from "../tables/CoutingPresenceTable"; // ajusta la ruta si es necesario

const ConteoPresenciaPage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-center py-12 px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-6xl w-full space-y-10 border border-gray-200">
          <h1 className="text-4xl font-bold text-center text-gray-800 tracking-tight">
            Conteo de Presencia Animal
          </h1>
          
          <CoutingPresenceTable />
        </div>
      </div>
    </div>
  );
};

export default ConteoPresenciaPage;
