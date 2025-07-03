import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import TablaHorarios from "../tables/TablaHorarios";
import RegistrarHorarios from "../forms/RegistrarHorarios";
import BaseLayout from "../components/BaseLayout";

const Horarios = () => {
  const [horarios, setHorarios] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [horarioEditado, setHorarioEditado] = useState(null);

  const abrirNuevo = () => {
    setModoEdicion(false);
    setHorarioEditado(null);
    setMostrarFormulario(true);
  };

  const abrirEdicion = (horario) => {
    setModoEdicion(true);
    setHorarioEditado(horario);
    setMostrarFormulario(true);
  };

  const cerrarFormulario = () => {
    setMostrarFormulario(false);
    setModoEdicion(false);
    setHorarioEditado(null);
  };

  const actualizarHorarios = (lista) => {
    setHorarios(lista);
  };

  return (
    <BaseLayout title="Horarios Disponibles">
      {!mostrarFormulario ? (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={abrirNuevo}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Agregar Horario
            </button>
          </div>
          <TablaHorarios
            horarios={horarios}
            setHorarios={actualizarHorarios}
            onEdit={abrirEdicion}
          />
        </>
      ) : (
        <RegistrarHorarios
          horarioInicial={modoEdicion ? horarioEditado : null}
          onCancel={cerrarFormulario}
          onSaved={cerrarFormulario}
          refreshHorarios={() => {
          }}
        />
      )}
    </BaseLayout>
  );
};

export default Horarios;
