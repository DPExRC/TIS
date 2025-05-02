import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavBar";

const TotalAnimals = () => {
  const [animalsData, setAnimalsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/animales/")
      .then((response) => {
        if (response.data && response.data.animales) {
          setAnimalsData(response.data.animales);
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

  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-8">
        <section>
          <h2 className="text-xl font-semibold mb-2">Listado de animales por especie</h2>

          {loading && <p className="text-gray-500">Cargando...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {!loading && !error && (
            <div className="mt-4 space-y-6">
              {Object.entries(animalsData).map(([especie, subespecies]) => (
                typeof subespecies === 'object' && subespecies !== null && (
                  <div key={especie}>
                    <h3 className="text-lg font-bold text-white">{especie}</h3>

                    {Object.entries(subespecies).map(([subespecie, listaAnimales]) => (
                      Array.isArray(listaAnimales) && (
                        <div key={subespecie} className="ml-4 space-y-1">
                          <h4 className="text-md font-semibold text-white">{subespecie}</h4>
                          <ul className="list-disc pl-6 text-white">
                            {listaAnimales.map((animal, index) => (
                              <li key={`${especie}-${subespecie}-${index}`}>
                                Código: {animal.code}, Fecha de nacimiento: {animal.birthday || "N/A"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                )
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TotalAnimals;
