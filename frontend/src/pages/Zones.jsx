import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import { Button } from "../components/Button";

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedZone, setEditedZone] = useState("");

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const res = await fetch("http://localhost:8000/zonas/list/");
      const data = await res.json();
      setZones(data);
    } catch (error) {
      console.error("Error al obtener zonas:", error);
    }
  };

  const handleAddZone = async () => {
    const { value: newZone } = await Swal.fire({
      title: "Agregar nueva zona",
      input: "text",
      inputLabel: "Nombre de la zona",
      inputPlaceholder: "Ej: Zona Norte",
      showCancelButton: true,
      confirmButtonText: "Agregar",
      cancelButtonText: "Cancelar",
      inputValidator: (value) => {
        if (!value.trim()) return "Debes ingresar un nombre válido.";
        if (zones.includes(value.trim())) return "Esa zona ya está registrada.";
        return null;
      },
    });

    if (newZone) {
      try {
        const res = await fetch("http://localhost:8000/zonas/list/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre: newZone.trim() }),
        });
        if (!res.ok) throw new Error("Error al crear zona");
        await fetchZones();
        Swal.fire("Zona agregada", `"${newZone}" fue registrada correctamente.`, "success");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  const handleEditZone = (index) => {
    setEditIndex(index);
    setEditedZone(zones[index]);
  };

  const handleSaveEdit = async (index) => {
    const oldName = zones[index];
    const newName = editedZone.trim();
    if (!newName || zones.includes(newName)) return;

    try {
      const res = await fetch(`http://localhost:8000/zonas/${encodeURIComponent(oldName)}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevo_nombre: newName }),
      });
      if (!res.ok) throw new Error("Error al renombrar zona");
      await fetchZones();
      setEditIndex(null);
      setEditedZone("");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  };

  const handleDeleteZone = async (index) => {
    const zone = zones[index];
    const confirm = await Swal.fire({
      title: `¿Eliminar "${zone}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8000/zonas/${encodeURIComponent(zone)}/`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Error al eliminar zona");
        await fetchZones();
        Swal.fire("Eliminado", `"${zone}" fue eliminado correctamente.`, "success");
      } catch (error) {
        Swal.fire("Error", error.message, "error");
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-50">
        <Navbar />
        <div className="bg-gradient-to-r from-blue-400 to-blue-700 text-white py-8 px-6 shadow-md">
          <h1 className="text-2xl font-semibold">Zonas</h1>
        </div>

        <div className="p-6 text-black">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Zonas Registradas</h2>
            <Button className="bg-blue-600 text-white" onClick={handleAddZone}>
              Agregar Zona
            </Button>
          </div>

          <table className="w-full border border-gray-300 rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 border-b">Zona</th>
                <th className="text-left px-4 py-2 border-b">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {zones.length === 0 && (
                <tr>
                  <td colSpan="2" className="text-center text-gray-500 py-4">
                    No hay zonas registradas.
                  </td>
                </tr>
              )}
              {zones.map((zone, index) => (
                <tr key={zone}>
                  <td className="px-4 py-2 border-b">
                    {editIndex === index ? (
                      <input
                        type="text"
                        value={editedZone}
                        onChange={(e) => setEditedZone(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      zone
                    )}
                  </td>
                  <td className="px-4 py-2 border-b space-x-2">
                    {editIndex === index ? (
                      <button
                        onClick={() => handleSaveEdit(index)}
                        className="text-green-600 hover:underline"
                      >
                        Guardar
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEditZone(index)}
                        className="text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteZone(index)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Zones;
