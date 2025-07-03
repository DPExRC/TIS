
import React from "react";
import BaseLayout from "../components/BaseLayout";
import TablaTotalHorarios from "../tables/TablaTotalHorarios";

const TotalHorarios  = () => {
  return (
    <BaseLayout title={"Horarios Asignados"}>
      <TablaTotalHorarios />
    </BaseLayout>
  );
};

export default TotalHorarios;
