import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const AnimalCountTable = () => {
  const [dataAgrupada, setDataAgrupada] = useState({});

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/obtener-existencia/")
      .then((res) => {
        const actual = res.data.actual;
        const agrupado = {};

        for (const lugar in actual) {
          const especies = actual[lugar];
          agrupado[lugar] = {};

          for (const especie in especies) {
            const animales = especies[especie];
            agrupado[lugar][especie] = [];

            for (const animal in animales) {
              agrupado[lugar][especie].push({
                animal,
                actual: animales[animal].total,
              });
            }
          }
        }

        setDataAgrupada(agrupado);
      })
      .catch((err) => console.error("Error al obtener existencia:", err));
  }, []);

  return (
    <div>
      <div className="p-0 space-y-6">
        <section>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Lugar</th>
                  <th className="px-4 py-2 text-left">Especie</th>
                  <th className="px-4 py-2 text-left">Animal</th>
                  <th className="px-4 py-2 text-right">Actual</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(dataAgrupada).length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-gray-500">
                      Sin datos disponibles.
                    </td>
                  </tr>
                ) : (
                  Object.entries(dataAgrupada).map(([lugar, especies]) =>
                    Object.entries(especies).map(([especie, animales]) =>
                      animales.map((registro, idx) => (
                        <tr
                          key={`${lugar}-${especie}-${registro.animal}-${idx}`}
                          className="border-t hover:bg-gray-50 text-black"
                        >
                          <td className="px-4 py-2">{lugar}</td>
                          <td className="px-4 py-2">{especie}</td>
                          <td className="px-4 py-2">{registro.animal}</td>
                          <td className="px-4 py-2 text-right">{registro.actual}</td>
                        </tr>
                      ))
                    )
                  )
                )}
              </tbody>
            </table>
          </div>
        </section>


      </div>
    </div>
  );
};

export default AnimalCountTable;
