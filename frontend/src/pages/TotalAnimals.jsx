import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, CardContent } from "../components/Card";
import { Pencil, Trash2, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import BaseLayout from "../components/BaseLayout";

const TotalAnimals = () => {
  const [animalsData, setAnimalsData] = useState({});
  const [filteredData, setFilteredData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAndGroupAnimals = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/animales/total/");
      if (Array.isArray(response.data)) {
        const agrupado = {};
        response.data.forEach((animal) => {
          const especie = animal.especie || "Desconocida";
          const subespecie = animal.animal || "Desconocida";
          if (!agrupado[especie]) agrupado[especie] = {};
          if (!agrupado[especie][subespecie]) agrupado[especie][subespecie] = [];
          agrupado[especie][subespecie].push({
            code: animal.codigo,
            birthday: animal.fecha_nacimiento ? animal.fecha_nacimiento.split("T")[0] : "N/A",
          });
        });
        setAnimalsData(agrupado);
        setFilteredData(agrupado);
      } else {
        setError("Formato de datos no válido.");
      }
    } catch {
      setError("Error al cargar los datos.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAndGroupAnimals();
  }, []);

  useEffect(() => {
    const normalize = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (!searchTerm.trim()) {
      setFilteredData(animalsData);
    } else {
      const term = normalize(searchTerm);
      const filtered = Object.entries(animalsData)
        .filter(([especie]) => normalize(especie).includes(term))
        .reduce((acc, [k, v]) => {
          acc[k] = v;
          return acc;
        }, {});
      setFilteredData(filtered);
    }
  }, [searchTerm, animalsData]);

  const fechaLocalString = (fechaUTC) => {
    if (!fechaUTC) return "";
    const [y, m, d] = fechaUTC.split("-");
    const date = new Date(y, m - 1, d);
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const handleEdit = async (animal) => {
    const { value: nuevaFecha } = await Swal.fire({
      title: "Editar fecha de nacimiento",
      input: "date",
      inputLabel: `Fecha actual: ${fechaLocalString(animal.birthday)}`,
      inputValue: animal.birthday,
      showCancelButton: true,
      confirmButtonText: "Guardar",
      cancelButtonText: "Cancelar",
    });

    if (nuevaFecha && nuevaFecha !== animal.birthday) {
      try {
        const res = await fetch("http://127.0.0.1:8000/animales/editar/", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            codigo: animal.code,
            fecha_nacimiento: nuevaFecha,
          }),
        });

        if (res.ok) {
          await Swal.fire("Actualizado", "Fecha modificada correctamente.", "success");
          fetchAndGroupAnimals();
        } else {
          const data = await res.json();
          throw new Error(data.error || "Error al actualizar.");
        }
      } catch (e) {
        await Swal.fire("Error inesperado", e.message, "error");
      }
    }
  };

  const handleDelete = async (animal) => {
    const confirmar = await Swal.fire({
      title: `¿Eliminar animal ${animal.code}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmar.isConfirmed) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/animales/eliminar/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codigo: animal.code,
          nacimiento: animal.birthday,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        await Swal.fire("¡Eliminado!", data.message || "Animal eliminado exitosamente.", "success");
        fetchAndGroupAnimals();
      } else {
        throw new Error(data.error || "No se pudo eliminar.");
      }
    } catch (e) {
      await Swal.fire("Error inesperado", e.message, "error");
    }
  };

  const handleQR = async (animal) => {
    const temp = document.createElement("div");
    document.body.appendChild(temp);
    const root = ReactDOM.createRoot(temp);
    root.render(
      <QRCodeCanvas
        value={animal.code}
        size={200}
        level="H"
        includeMargin={true}
      />
    );

    setTimeout(() => {
      const canvas = temp.querySelector("canvas");
      if (canvas) {
        const dataUrl = canvas.toDataURL("image/png");
        Swal.fire({
          title: `QR de ${animal.code}`,
          html: `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
              <img src="${dataUrl}" alt="QR" width="200" height="200" style="margin: 10px auto;" />
              <button id="descargarQR" style="
                margin-top: 15px;
                padding: 8px 16px;
                background-color: #2563eb;
                color: white;
                border: none;
                border-radius: 6px;
                font-weight: bold;
                cursor: pointer;
              ">
                Descargar QR
              </button>
            </div>
          `,
          showConfirmButton: true,
          confirmButtonText: "Cerrar",
          didOpen: () => {
            const btn = document.getElementById("descargarQR");
            if (btn) {
              btn.addEventListener("click", () => {
                const a = document.createElement("a");
                a.href = dataUrl;
                a.download = `QR-${animal.code}.png`;
                a.click();
              });
            }
          },
        });
      } else {
        Swal.fire("Error", "No se pudo generar el QR", "error");
      }
      root.unmount();
      document.body.removeChild(temp);
    }, 200);
  };

  return (
    <BaseLayout title="Total de animales registrados">
      <div className="max-w-screen-xl mx-auto px-4 space-y-6">
        <input
          type="text"
          placeholder="Buscar por especie..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/3 px-4 py-2 rounded-md border border-gray-300 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {loading && (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(filteredData).map(([especie, subespecies]) => (
              <Card key={especie}>
                <CardContent className="p-4 space-y-6 text-black">
                  <h2 className="text-2xl font-bold mb-4">{especie}</h2>
                  {Object.entries(subespecies).map(([subespecie, listaAnimales]) => (
                    <div key={subespecie} className="mb-6">
                      <h3 className="text-lg font-semibold mb-2">{subespecie}</h3>
                      <table className="w-full text-sm text-center text-gray-700">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="px-2 py-1">Código</th>
                            <th className="px-2 py-1">Nacimiento</th>
                            <th className="px-1 py-1 w-20 whitespace-nowrap">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {listaAnimales.map((animal, index) => (
                            <tr key={`${especie}-${subespecie}-${index}`} className="hover:bg-gray-50">
                              <td>{animal.code}</td>
                              <td>{animal.birthday || "N/A"}</td>
                              <td className="flex justify-center gap-2">
                                <button onClick={() => handleEdit(animal)} title="Editar" className="hover:text-blue-900">
                                  <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDelete(animal)} title="Eliminar" className="hover:text-red-700">
                                  <Trash2 size={18} />
                                </button>
                                <button onClick={() => handleQR(animal)} title="Ver QR" className="hover:text-green-700">
                                  <QrCode size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </BaseLayout>
  );
};

export default TotalAnimals;
