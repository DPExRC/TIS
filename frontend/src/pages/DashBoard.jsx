import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import CoutingPresenceTable from "../tables/CoutingPresenceTable";
import { Card, CardContent } from "../components/Card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../components/Select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [speciesOptions, setSpeciesOptions] = useState({});
  const [selectedZone, setSelectedZone] = useState("");
  const [selectedSpecies, setSelectedSpecies] = useState("");
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [dataBar, setDataBar] = useState([]);

  const colores = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff8042",
    "#a4de6c",
    "#d0ed57",
    "#8dd1e1",
  ];

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
    <div className="flex flex-col md:flex-row min-h-screen">
      <Sidebar />

      <div className="flex-1 md:ml-50">
        <Navbar />

        <div className="ml-0 bg-gradient-to-r from-blue-400 to-blue-700 text-white py-8 md:py-12 shadow-md">
          <div className="px-4 md:px-6">
            <h1 className="text-xl md:text-2xl font-semibold">Dashboard</h1>
          </div>
        </div>

        <div className="p-4 md:p-6 w-full overflow-x-auto">
          {/* ALERTAS */}
          <div className="mb-6">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">¡Atención!</strong>
              <span className="block sm:inline">
                {" "}
                Hay animales registrados como faltantes en una o más zonas.
              </span>
            </div>
          </div>

          <div className="grid gap-4 md:gap-6">
            {/* Controles de filtro */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4 md:mb-6">
              {/* Zona */}
              <div className="bg-white rounded-lg w-full sm:w-auto">
                <Select
                  value={selectedZone}
                  onValueChange={(value) => setSelectedZone(value)}
                >
                  <SelectTrigger className="w-full sm:w-44 h-12 text-base text-black px-4 py-2">
                    <SelectValue placeholder="Zona" />
                  </SelectTrigger>
                  <SelectContent className="text-sm text-black max-h-60 overflow-auto">
                    <SelectItem value="todas">Todas</SelectItem>
                    {dataBar.map((zona) => (
                      <SelectItem key={zona.name} value={zona.name}>
                        {zona.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Especie */}
              <div className="bg-white rounded-lg w-full sm:w-auto">
                <Select
                  value={selectedSpecies}
                  onValueChange={(value) => {
                    setSelectedSpecies(value);
                    setSelectedAnimal("");
                  }}
                >
                  <SelectTrigger className="w-full sm:w-44 h-12 text-base text-black px-4 py-2">
                    <SelectValue placeholder="Especie" />
                  </SelectTrigger>
                  <SelectContent className="text-sm text-black max-h-60 overflow-auto">
                    {Object.keys(speciesOptions).map((specie) => (
                      <SelectItem key={specie} value={specie}>
                        {specie}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Animal */}
              <div className="bg-white rounded-lg w-full sm:w-auto">
                <Select
                  value={selectedAnimal}
                  onValueChange={setSelectedAnimal}
                  disabled={!selectedSpecies}
                >
                  <SelectTrigger className="w-full sm:w-44 h-12 text-base text-black px-4 py-2">
                    <SelectValue placeholder="Animal" />
                  </SelectTrigger>
                  <SelectContent className="text-sm text-black max-h-60 overflow-auto">
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
              <CardContent className="p-3 md:p-4">
                <h3 className="font-bold mb-3 md:mb-4 text-black">
                  Existencia por Zona y Especie
                </h3>
                <div className="w-full h-[250px] md:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        selectedZone
                          ? dataBar.filter((d) => d.name === selectedZone)
                          : dataBar
                      }
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Legend />
                      {especiesEnDataBar.map((especie, idx) => (
                        <Bar
                          key={especie}
                          dataKey={especie}
                          fill={colores[idx % colores.length]}
                          isAnimationActive={false}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Tabla */}
            <div className="overflow-x-auto">
              <CoutingPresenceTable />
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 text-black">
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-sm md:text-base">Ganado Total</p>
                  <h2 className="text-xl md:text-2xl font-bold">100</h2>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-sm md:text-base">Ganado Faltante</p>
                  <h2 className="text-xl md:text-2xl font-bold">2</h2>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-sm md:text-base">Hora Registro</p>
                  <h2 className="text-xl md:text-2xl font-bold">16:00</h2>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 md:p-4">
                  <p className="text-sm md:text-base">Personal</p>
                  <h2 className="text-xl md:text-2xl font-bold">Juanito Perez</h2>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;