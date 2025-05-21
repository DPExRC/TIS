import Navbar from "../components/NavBar";
import CoutingPresenceData from "../data/CountingPresenceData";
import CoutingPresenceTable from "../tables/CoutingPresenceTable";
import RegistroExistenciaAnimales from "../forms/RegistroExistenciaAnimales"

const CoutingPresence = () => {
  return (
    <div>
      <Navbar />
      <CoutingPresenceData/>
      <RegistroExistenciaAnimales/>
      <CoutingPresenceTable/>
    </div>
  )
}
export default CoutingPresence;
