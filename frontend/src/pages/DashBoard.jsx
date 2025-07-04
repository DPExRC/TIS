import { useEffect, useState } from "react";
import BaseLayout from "../components/BaseLayout";
import Indicadores from "../data/Indicadores";
import ExistenciaTable from "../tables/ExistenciaTable";

const Dashboard = () => {
  const [faltantesRanking, setFaltantesRanking] = useState([]);
  const [asistenciaPorDia, setAsistenciaPorDia] = useState([]);
  const [topReincidentes, setTopReincidentes] = useState([]);

  return (
    <BaseLayout title="Dashboard">
      <div className="grid grid-cols-1 gap-6 w-full max-w-screen-xl mx-auto">
        <Indicadores
          totalGanado={123}
          faltantesTotales={5}
          asistenciaPromedio="96%"
          zonaConMasFaltas={faltantesRanking[0]?.zona || "-"}
          faltantesRanking={faltantesRanking}
          asistenciaPorDia={asistenciaPorDia}
          topReincidentes={topReincidentes}
        />

        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalle por Asignación</h2>
          <ExistenciaTable />
        </div>
      </div>
    </BaseLayout>
  );
};

export default Dashboard;
