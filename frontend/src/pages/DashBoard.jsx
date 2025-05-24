import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavBar";
import { ResponsiveContainer } from "recharts";

import { Card, CardContent } from "../components/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/Select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [speciesOptions, setSpeciesOptions] = useState({});
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [dataBar, setDataBar] = useState([]);

  const colores = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

  const dataLine = [
    { name: "1", CPM: 2500, CPP: 2800 },
    { name: "2", CPM: 2200, CPP: 3000 },
    { name: "3", CPM: 2600, CPP: 3700 },
    { name: "4", CPM: 2100, CPP: 2900 },
    { name: "5", CPM: 2400, CPP: 4100 },
  ];

  // Actualizado para usar el bloque 'actual'
  const transformarExistencia = (apiData) => {
    const animales = apiData.actual;
    const resultado = [];

    for (const zona in animales) {
      const especies = animales[zona];
      const entrada = { name: zona };

      for (const especie in especies) {
        let totalEspecie = 0;
        const tipos = especies[especie];

        for (const tipo in tipos) {
          if (tipos[tipo]?.total !== undefined) {
            totalEspecie += tipos[tipo].total;
          }
        }

        entrada[especie] = totalEspecie;
      }

      resultado.push(entrada);
    }

    return resultado;
  };

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/animales/")
      .then((res) => {
        if (res.data?.animales) {
          setSpeciesOptions(res.data.animales);
        }
      })
      .catch((err) => console.error("Error al obtener animales:", err));

    axios
      .get("http://127.0.0.1:8000/obtener-existencia/")
      .then((res) => {
        if (res.data?.actual) {
          const datosTransformados = transformarExistencia(res.data);
          setDataBar(datosTransformados);
        }
      })
      .catch((err) => console.error("Error al obtener existencia:", err));
  }, []);

  const animalOptions =
    selectedSpecies && speciesOptions[selectedSpecies]
      ? Object.keys(speciesOptions[selectedSpecies]).filter(
          (key) => key !== "registro"
        )
      : [];

  const especiesEnDataBar = Array.from(
    new Set(
      dataBar.flatMap((zona) =>
        Object.keys(zona).filter((key) => key !== "name")
      )
    )
  );

  return (
    <div>
      <Navbar />
      <div className="p-6 min-w-[1024px]">
        <div className="p-6 grid gap-6">
          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-4 gap-4 text-black">
            <Card>
              <CardContent className="p-4">
                <p>Ganado Total</p>
                <h2 className="text-2xl font-bold">100</h2>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p>Ganado Faltante</p>
                <h2 className="text-2xl font-bold">2</h2>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p>Hora Registro</p>
                <h2 className="text-2xl font-bold">16:00</h2>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p>Personal</p>
                <h2 className="text-2xl font-bold">Juanito Perez</h2>
              </CardContent>
            </Card>
          </div>

          {/* Selects dinámicos */}
          <div className="flex gap-4">
            <div className="text-xl bg-white max-w-[160px] rounded-lg">
              <Select
                value={selectedSpecies}
                onValueChange={(value) => {
                  setSelectedSpecies(value);
                  setSelectedAnimal("");
                }}
              >
                <SelectTrigger className="w-44 h-12 text-base text-black px-4 py-2">
                  <SelectValue placeholder="Especie" />
                </SelectTrigger>
                <SelectContent className="text-sm text-black">
                  {Object.keys(speciesOptions).map((specie) => (
                    <SelectItem key={specie} value={specie}>
                      {specie}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-xl bg-white max-w-[160px] rounded-lg">
              <Select
                value={selectedAnimal}
                onValueChange={setSelectedAnimal}
                disabled={!selectedSpecies}
              >
                <SelectTrigger className="w-44 h-12 text-base text-black px-4 py-2">
                  <SelectValue placeholder="Animal" />
                </SelectTrigger>
                <SelectContent className="text-sm text-black">
                  {animalOptions.map((animal) => (
                    <SelectItem key={animal} value={animal}>
                      {animal}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gráfico de barras */}
          <Card className="w-full">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2 text-black">Existencia</h3>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dataBar}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {especiesEnDataBar.map((especie, idx) => (
                      <Bar
                        key={especie}
                        dataKey={especie}
                        fill={colores[idx % colores.length]}
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de líneas */}
          <Card className="w-full">
            <CardContent className="p-4">
              <h3 className="font-bold mb-2 text-black">Total</h3>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataLine}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="CPM" stroke="#8884d8" />
                    <Line type="monotone" dataKey="CPP" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
