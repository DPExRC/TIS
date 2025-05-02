import Navbar from "../components/NavBar";
import CoutingPresenceData from "../data/CountingPresenceData";
import CoutingPresenceTable from "../tables/CoutingPresenceTable";


const CoutingPresence = () => {
  return (
    <div>
      <Navbar />
      <CoutingPresenceData/>
      <CoutingPresenceTable/>
    </div>
  )
}
export default CoutingPresence;
