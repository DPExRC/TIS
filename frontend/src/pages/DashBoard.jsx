import { useEffect, useState } from "react";
import axios from "axios";
import BaseLayout from "../components/BaseLayout";
import Indicadores from "../data/Indicadores";
import ExistenciaTable from "../tables/ExistenciaTable";

const Dashboard = () => {
  const [faltantesRanking, setFaltantesRanking] = useState([]);
  const [asistenciaPorDia, setAsistenciaPorDia] = useState([]);
  const [topReincidentes, setTopReincidentes] = useState([]);

  const [existenciaData, setExistenciaData] = useState([]);
  const [loadingExistencia, setLoadingExistencia] = useState(true);
  const [errorExistencia, setErrorExistencia] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/existencia/list/")
      .then(res => setExistenciaData(res.data))
      .catch(() => setErrorExistencia("Error cargando datos de existencia"))
      .finally(() => setLoadingExistencia(false));

    axios.get("http://localhost:8000/ranking-faltantes/")
      .then(res => setFaltantesRanking(res.data));

    axios.get("http://localhost:8000/asistencia-dia/")
      .then(res => setAsistenciaPorDia(res.data));

    axios.get("http://localhost:8000/reincidentes/")
      .then(res => setTopReincidentes(res.data));
  }, []);

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
          {loadingExistencia && <p className="text-gray-600">Cargando tabla de existencia...</p>}
          {errorExistencia && <p className="text-red-600">{errorExistencia}</p>}
          {!loadingExistencia && !errorExistencia && (
            <ExistenciaTable existenciaData={existenciaData} />
          )}
        </div>
      </div>
    </BaseLayout>
  );
};

export default Dashboard;
