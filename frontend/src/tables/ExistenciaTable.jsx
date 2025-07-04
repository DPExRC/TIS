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

const RANGOS_FECHA = {
  HOY: "hoy",
  AYER: "ayer",
  DOS_DIAS: "2dias",
  TODO: "todo",
};

// Normaliza una fecha para comparar solo año-mes-día
const normalizarFecha = (fechaStr) => {
  const f = new Date(fechaStr);
  return new Date(f.getFullYear(), f.getMonth(), f.getDate());
};

// Filtra registros según el rango seleccionado
const filtrarPorRango = (registros, rango) => {
  if (rango === RANGOS_FECHA.TODO) return registros;

  const hoy = normalizarFecha(new Date());
  const ayer = new Date(hoy);
  ayer.setDate(hoy.getDate() - 1);
  const anteayer = new Date(hoy);
  anteayer.setDate(hoy.getDate() - 2);

  return registros.filter((r) => {
    const fecha = normalizarFecha(r.fecha_creacion);
    if (rango === RANGOS_FECHA.HOY) return fecha.getTime() === hoy.getTime();
    if (rango === RANGOS_FECHA.AYER) return fecha.getTime() === ayer.getTime();
    if (rango === RANGOS_FECHA.DOS_DIAS)
      return (
        fecha.getTime() === hoy.getTime() ||
        fecha.getTime() === ayer.getTime() ||
        fecha.getTime() === anteayer.getTime()
      );
    return true;
  });
};

// Agrupa los códigos escaneados por zona y especie
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
  const [tipoFiltro, setTipoFiltro] = useState("ingreso"); // ingreso | egreso
  const [rangoFecha, setRangoFecha] = useState(RANGOS_FECHA.TODO);

  useEffect(() => {
    axios.get("http://localhost:8000/existencia/list/").then((res) => {
      const porTipo = res.data.filter((r) => r.tipo === tipoFiltro);
      const porFecha = filtrarPorRango(porTipo, rangoFecha);
      const datosTransformados = transformarExistencia(porFecha);
      setExistenciaData(datosTransformados);
    });
  }, [tipoFiltro, rangoFecha]);

  return (
    <Card className="bg-white shadow-md border border-gray-200">
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">
            Existencia de {tipoFiltro}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              onClick={() =>
                setTipoFiltro(tipoFiltro === "ingreso" ? "egreso" : "ingreso")
              }
              className="text-sm"
            >
              Ver {tipoFiltro === "ingreso" ? "egresos" : "ingresos"}
            </Button>

            <select
              value={rangoFecha}
              onChange={(e) => setRangoFecha(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={RANGOS_FECHA.HOY}>Hoy</option>
              <option value={RANGOS_FECHA.AYER}>Ayer</option>
              <option value={RANGOS_FECHA.DOS_DIAS}>Últimos 2 días</option>
              <option value={RANGOS_FECHA.TODO}>Todos</option>
            </select>
          </div>
        </div>

        {existenciaData.length === 0 ? (
          <p className="text-gray-600">No hay datos disponibles para el filtro seleccionado.</p>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default ExistenciaTable;
