import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegistrarHorarios = ({ horarioInicial, onCancel }) => {
  const [nombre, setNombre] = useState(horarioInicial?.nombre || "");
  const [ingreso, setIngreso] = useState(horarioInicial?.ingreso || "");
  const [egreso, setEgreso] = useState(horarioInicial?.egreso || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const mostrarNotificacion = (datos) => {
    toast.success(
      <div>
        <strong>Horario guardado:</strong><br />
        Nombre: {datos.nombre}<br />
        Horario: {datos.horarios[0]} - {datos.horarios[1]}
      </div>,
      {
        position: "top-right",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!nombre || !ingreso || !egreso) {
      setErrorMsg("Por favor complete todos los campos requeridos.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:8000/horarios/guardar/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          horarios: [ingreso, egreso],
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        setErrorMsg(err.error || "Error al guardar el horario.");
        setIsSubmitting(false);
        return;
      }

      const result = await response.json();

      mostrarNotificacion({
        nombre,
        horarios: [ingreso, egreso],
      });

      setNombre("");
      setIngreso("");
      setEgreso("");
      setIsSubmitting(false);

    } catch (error) {
      setErrorMsg("Error inesperado al guardar.");
      console.error("Error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow-md rounded-xl relative">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-6 max-w-full mx-auto">

        <div>
          <label className="block text-sm font-medium mb-1">Nombre del Horario</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border p-2 rounded-xl"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Hora Ingreso</label>
          <input
            type="time"
            value={ingreso}
            onChange={(e) => setIngreso(e.target.value)}
            className="w-full border p-2 rounded-xl"
            required
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Hora Egreso</label>
          <input
            type="time"
            value={egreso}
            onChange={(e) => setEgreso(e.target.value)}
            className="w-full border p-2 rounded-xl"
            required
            disabled={isSubmitting}
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 text-black rounded-full hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-full text-white ${
              isSubmitting ? "bg-gray-400 cursor-wait" : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistrarHorarios;
