
import React from "react";
import BaseLayout from "../components/BaseLayout";
import CoutingPresenceForm from "../forms/RegistroExistenciaAnimales";

const CoutingPresence = () => {
  return (
    <BaseLayout title={"Conteo de Presencia"}>
      <CoutingPresenceForm/>
    </BaseLayout>
  );
};

export default CoutingPresence;
