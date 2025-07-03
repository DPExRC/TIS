// components/ZonesTable.jsx
import { Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "../components/Button";
import Swal from "sweetalert2";

export const ZonesTable = ({ 
  zones, 
  onAddZone,
  editIndex,
  editedZone,
  setEditedZone,
  fetchZones
}) => {
  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditedZone(zones[index]);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
    setEditedZone("");
  };

  const confirmEdit = async (index) => {
    const oldName = zones[index];
    const newName = editedZone.trim();

    if (oldName === newName) {
      handleCancelEdit();
      return;
    }

    const confirm = await Swal.fire({
      title: `¿Actualizar zona "${oldName}"?`,
      html: `
        <div class="text-left">
          <p>Nombre actual: <strong>${oldName}</strong></p>
          <p>Nuevo nombre: <strong>${newName || '(vacío)'}</strong></p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, actualizar",
      cancelButtonText: "Cancelar",
    });

    if (confirm.isConfirmed) {
      await performEdit(oldName, newName);
    }
  };

  const performEdit = async (oldName, newName) => {
    if (!newName) {
      await Swal.fire({
        title: "Nombre vacío",
        text: "Debe ingresar un nombre válido para la zona",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (zones.includes(newName)) {
      await Swal.fire({
        title: "Zona existente",
        text: "Ya existe una zona con ese nombre",
        icon: "warning",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/zonas/${encodeURIComponent(oldName)}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nuevo_nombre: newName }),
      });
      
      if (!res.ok) throw new Error("Error al renombrar zona");
      
      await Swal.fire({
        title: "¡Actualizado!",
        text: `La zona se ha actualizado correctamente`,
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
      
      fetchZones();
      setEditIndex(null);
      setEditedZone("");
    } catch (error) {
      await Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        confirmButtonColor: "#3085d6",
      });
    }
  };

  const handleDeleteZone = async (zone) => {
    const confirmar = await Swal.fire({
      title: `¿Eliminar zona "${zone}"?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (confirmar.isConfirmed) {
      try {
        const res = await fetch(`http://localhost:8000/zonas/${encodeURIComponent(zone)}/`, {
          method: "DELETE",
        });
        
        if (!res.ok) throw new Error("Error al eliminar zona");
        
        await Swal.fire({
          title: "¡Eliminado!",
          text: `La zona "${zone}" ha sido eliminada`,
          icon: "success",
          confirmButtonColor: "#3085d6",
        });
        
        fetchZones();
      } catch (error) {
        await Swal.fire({
          title: "Error",
          text: error.message,
          icon: "error",
          confirmButtonColor: "#3085d6",
        });
      }
    }
  };

  return (
    <div className="p-6 text-black">
      <div className="mb-6 flex justify-between items-center">
        <Button className="bg-blue-600 text-white" onClick={onAddZone}>
          Agregar Zona
        </Button>
      </div>

      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left px-4 py-3 border-b font-medium">Zona</th>
            <th className="text-left px-4 py-3 border-b font-medium">Acciones</th>
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
            <tr key={zone} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 border-b">
                {editIndex === index ? (
                  <input
                    type="text"
                    value={editedZone}
                    onChange={(e) => setEditedZone(e.target.value)}
                    className="border border-gray-300 rounded px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') confirmEdit(index);
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                  />
                ) : (
                  <span className="font-medium text-gray-800">{zone}</span>
                )}
              </td>
              <td className="px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  {editIndex === index ? (
                    <>
                      <button
                        onClick={() => confirmEdit(index)}
                        className="p-1.5 text-green-600 hover:text-green-800 rounded-full hover:bg-green-50 transition-colors"
                        title="Guardar cambios"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                        title="Cancelar edición"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditClick(index)}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50 transition-colors"
                        title="Editar zona"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteZone(zone)}
                        className="p-1.5 text-red-600 hover:text-red-800 rounded-full hover:bg-red-50 transition-colors"
                        title="Eliminar zona"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};