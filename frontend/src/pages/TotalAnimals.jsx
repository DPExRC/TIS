import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import Navbar from "../components/NavBar";
import { Card, CardContent } from "../components/Card";
import { Pencil, Trash2 } from "lucide-react";
import "../styles/TotalAnimals.css";

const TotalAnimals = () => {
  const [animalsData, setAnimalsData] = useState({});
  const [filteredData, setFilteredData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/animales/")
      .then((response) => {
        if (response.data && response.data.animales) {
          setAnimalsData(response.data.animales);
          setFilteredData(response.data.animales);
        } else {
          setError("No se pudo obtener información de los animales.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los datos.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const normalizeString = (str) =>
      str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

    if (searchTerm.trim() === "") {
      setFilteredData(animalsData);
    } else {
      const term = normalizeString(searchTerm);

      const filtered = Object.entries(animalsData)
        .filter(([especie]) => normalizeString(especie).includes(term))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      setFilteredData(filtered);
    }
  }, [searchTerm, animalsData]);

  const handleEdit = (animal) => {
    const nuevoNacimiento = prompt(
      `Editar fecha de nacimiento para ${animal.code}:`,
      animal.birthday
    );
    if (nuevoNacimiento && nuevoNacimiento !== animal.birthday) {
      console.log(`Actualizar ${animal.code} a ${nuevoNacimiento}`);
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
      const response = await fetch("http://127.0.0.1:8000/eliminar-animal/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          codigo: animal.code,
          nacimiento: animal.birthday,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await Swal.fire({
          title: "¡Eliminado!",
          text: data.message || "El animal ha sido eliminado exitosamente.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        await Swal.fire({
          title: "Error",
          text: data.error || "No se pudo eliminar el animal.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch (error) {
      await Swal.fire({
        title: "Error inesperado",
        text: error.message,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div>
      <Navbar />
      <section className="fixed top-23 left-3 w-full z-50 py-4" style={{ backgroundColor: "#242424" }}>
        <div className="max-w-screen-xl mx-auto px-4 text-white">
          <input
            type="text"
            placeholder="Buscar por especie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 px-4 py-2 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </section>

      <div className="p-6 space-y-6 mt-32">
        {loading && <p className="text-gray-500">Cargando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(filteredData).map(([especie, subespecies]) => (
              <Card key={especie}>
                <CardContent className="p-4 space-y-6 text-black">
                  <h2 className="text-2xl font-bold mb-4">{especie}</h2>
                  {Object.entries(subespecies).map(
                    ([subespecie, listaAnimales]) =>
                      Array.isArray(listaAnimales) && (
                        <div key={subespecie} className="mb-6">
                          <h3 className="text-lg font-semibold mb-2">
                            {subespecie}
                          </h3>
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
                                    <button onClick={() => handleEdit(animal)} title="Editar" className="hover:text-blue-900" id="btnEdit">
                                      <Pencil size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(animal)} title="Eliminar" className="hover:text-red-700" id="btnDelete">
                                      <Trash2 size={18} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TotalAnimals;
