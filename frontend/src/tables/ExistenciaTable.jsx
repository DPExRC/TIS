import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";

const colores = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c", "#d0ed57"];

// Retorna fecha con solo año-mes-día en UTC para comparar sin hora
const normalizarFecha = (fechaStr) => {
  const f = new Date(fechaStr);
  return new Date(f.getFullYear(), f.getMonth(), f.getDate());
};

// Filtra solo registros de hoy o ayer
const filtrarFechaReciente = (registros) => {
  const hoy = new Date();
  const ayer = new Date();
  ayer.setDate(hoy.getDate() - 1);

  return registros.filter((r) => {
    const fecha = normalizarFecha(r.fecha_creacion);
    return (
      fecha.getTime() === normalizarFecha(hoy).getTime() ||
      fecha.getTime() === normalizarFecha(ayer).getTime()
    );
  });
};

// Transforma datos por zona y especie
const transformarExistencia = (datos) => {
  const agrupado = {};

  datos.forEach((registro) => {
    const { zona, codigos_escaneados = [] } = registro;
    const especies = {};

    codigos_escaneados.forEach((codigo) => {
      const [prefijo] = codigo.split("-");
      if (!especies[prefijo]) especies[prefijo] = 0;
      especies[prefijo]++;
    });

    if (!agrupado[zona]) agrupado[zona] = {};

    for (const especie in especies) {
      if (!agrupado[zona][especie]) agrupado[zona][especie] = 0;
      agrupado[zona][especie] += especies[especie];
    }
  });

  return Object.entries(agrupado).map(([zona, especies]) => ({
    name: zona,
    ...especies,
  }));
};

const ExistenciaTable = () => {
  const [existenciaData, setExistenciaData] = useState([]);
  const [tipoFiltro, setTipoFiltro] = useState("ingreso"); // "ingreso" o "egreso"

  useEffect(() => {
    axios.get("http://localhost:8000/existencia/list/").then((res) => {
      const recientes = filtrarFechaReciente(res.data);
      const filtradosPorTipo = recientes.filter((r) => r.tipo === tipoFiltro);
      const datosTransformados = transformarExistencia(filtradosPorTipo);
      setExistenciaData(datosTransformados);
    });
  }, [tipoFiltro]);

  return (
    <Card className="bg-white shadow-md border border-gray-200">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            Existencia de {tipoFiltro}
          </h3>
          <Button
            onClick={() =>
              setTipoFiltro(tipoFiltro === "ingreso" ? "egreso" : "ingreso")
            }
            className="text-sm"
          >
            Ver {tipoFiltro === "ingreso" ? "egresos" : "ingresos"}
          </Button>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={existenciaData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            {Object.keys(existenciaData[0] || {})
              .filter((k) => k !== "name")
              .map((key, i) => (
                <Bar
                  key={key}
                  dataKey={key}
                  stackId="a"
                  fill={colores[i % colores.length]}
                />
              ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ExistenciaTable;
