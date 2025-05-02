import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useState } from "react";
import Navbar from "../components/NavBar";

const data = [
  { name: "Vacas", presentes: 120, faltantes: 5 },
  { name: "Chivos", presentes: 80, faltantes: 2 },
  { name: "Pollos", presentes: 150, faltantes: 12 },
];

export default function Dashboard() {
  const [fecha, setFecha] = useState("2025-04-16");

  return (
    <div>
      <Navbar/>
      <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        <Card className="col-span-1 xl:col-span-3">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4 text-black">
              <h2 className="text-xl font-bold">Resumen General</h2>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="border p-2 rounded"
              />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="presentes" fill="#4ade80" name="Presentes" />
                <Bar dataKey="faltantes" fill="#f87171" name="Faltantes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2">Alertas Recientes</h3>
            <ul className="space-y-1 text-black">
              <li>🟥 12 pollos faltantes - Zona Sur</li>
              <li>🟥 5 vacas no registradas - Zona Este</li>
              <li>🟨 2 chivos recontados manualmente</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-black">Accesos Rápidos</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button>Registrar Animales</Button>
              <Button>Conteo Diario</Button>
              <Button>Ver Reportes</Button>
              <Button>Configurar Alertas</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-black">
            <h3 className="text-lg font-semibold mb-2">Resumen de Registro</h3>
            <p className="text-sm">Último registro: 2025-04-15 18:40</p>
            <p className="text-sm">Registrador: Juan Pérez</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
