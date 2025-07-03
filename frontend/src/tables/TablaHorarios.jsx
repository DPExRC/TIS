import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TablaHorarios = ({ onEdit }) => {
  const navigate = useNavigate();

  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const fetchHorarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/horarios/listar/");
      const data = await res.json();
      setHorarios(data || []);
    } catch (err) {
      console.error("Error al obtener horarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHorarios();
  }, []);

  const separarHorario = (horarioStr) => {
    const partes = horarioStr.split(" - ");
    return {
      ingreso: partes[0] || "-",
      egreso: partes[1] || "-",
    };
  };

  const eliminarHorario = async (nombre, ingreso, egreso) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar horario?",
      html: `¿Eliminar horario de <b>${nombre}</b> (${ingreso} - ${egreso})?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8000/horarios/${nombre}/`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ingreso, egreso }),
        });

        const data = await res.json();

        if (res.ok) {
          Swal.fire("Eliminado", data.mensaje, "success");
          fetchHorarios();
        } else {
          Swal.fire("Error", data.error || "No se pudo eliminar", "error");
        }
      } catch (err) {
        Swal.fire("Error", "No se pudo conectar con el servidor", "error");
      }
    }
  };

  const normalizarTexto = (texto) =>
    texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  // Filtramos horarios sin desglosar por día, solo uno por nombre
  const filtrados = horarios.filter((h) => {
    const termino = normalizarTexto(busqueda);
    const { ingreso, egreso } = separarHorario(h.horario);
    return (
      normalizarTexto(h.nombre).includes(termino) ||
      normalizarTexto(ingreso).includes(termino) ||
      normalizarTexto(egreso).includes(termino)
    );
  });

  return (
    <div className="space-y-6">
      <input
        type="text"
        placeholder="Buscar por nombre, ingreso o egreso..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="mb-4 w-full px-3 py-2 border border-gray-300 rounded"
      />

      {loading ? (
        <p className="text-gray-500">Cargando horarios...</p>
      ) : filtrados.length === 0 ? (
        <p className="text-gray-500">No hay horarios registrados.</p>
      ) : (
        <div className="border border-gray-300 rounded-lg shadow">
          <table className="w-full text-left">
            <thead className="bg-gray-200 border-b">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Ingreso</th>
                <th className="px-4 py-3">Egreso</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((item, idx) => {
                const { ingreso, egreso } = separarHorario(item.horario);
                return (
                  <tr key={`${item.nombre}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2">{item.nombre}</td>
                    <td className="px-4 py-2">{ingreso}</td>
                    <td className="px-4 py-2">{egreso}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">

                        <button
                          onClick={() =>
                            eliminarHorario(item.nombre, ingreso, egreso)
                          }
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TablaHorarios;
