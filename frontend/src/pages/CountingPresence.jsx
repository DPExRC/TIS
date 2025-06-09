import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";

import CoutingPresenceData from "../data/CountingPresenceData";
import CoutingPresenceTable from "../tables/CoutingPresenceTable";
import RegistroExistenciaAnimales from "../forms/RegistroExistenciaAnimales";


const CoutingPresence = () => {
  return (
    <div>
      <Sidebar />

      <div className="ml-50">
        <Navbar />

        <div className="ml-0 bg-gradient-to-r from-blue-400 to-blue-700 text-white py-12 shadow-md">
          <div className="px-6">
            <h1 className="text-2xl font-semibold">Conteo y Presencia de Animales</h1>
          </div>
        </div>

        <main className="p-6 space-y-6">


        <section className="flex justify-center">
          <div className="w-1/2">
            <RegistroExistenciaAnimales />
          </div>
        </section>

          {/*
          <section>
            <CoutingPresenceData />
          </section>
          */}

          <section>
            <CoutingPresenceTable />
          </section>
        </main>
      </div>
    </div>
  );
};

export default CoutingPresence;

