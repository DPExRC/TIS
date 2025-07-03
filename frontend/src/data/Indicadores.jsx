// src/components/Indicadores.jsx

export default function Indicadores({
  totalGanado = 123,
  faltantesTotales = 5,
  asistenciaPromedio = "96%",
  zonaConMasFaltas = "Sur",
  faltantesRanking = [],
  asistenciaPorDia = [],
  topReincidentes = [],
}) {
  return (
    <div className="grid gap-6">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-gray-100 rounded shadow">
          <p>Total Ganado</p>
          <h2 className="text-2xl font-bold">{totalGanado}</h2>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <p>Faltantes Totales</p>
          <h2 className="text-2xl font-bold">{faltantesTotales}</h2>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <p>Asistencia Promedio (7 días)</p>
          <h2 className="text-2xl font-bold">{asistenciaPromedio}</h2>
        </div>
        <div className="p-4 bg-gray-100 rounded shadow">
          <p>Zona con más faltas</p>
          <h2 className="text-2xl font-bold">{zonaConMasFaltas}</h2>
        </div>
      </div>

      {/* Ranking faltantes */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">Ranking Zonas con más Faltas</h3>
        {faltantesRanking.length === 0 ? (
          <p className="italic text-gray-600">No hay datos.</p>
        ) : (
          <ul className="list-disc pl-5">
            {faltantesRanking.map((item, i) => (
              <li key={i}>{item.zona} - {item.faltantes} faltantes</li>
            ))}
          </ul>
        )}
      </div>

      {/* Asistencia por Día */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">Asistencia por Día (última semana)</h3>
        {asistenciaPorDia.length === 0 ? (
          <p className="italic text-gray-600">No hay datos.</p>
        ) : (
          <ul className="list-disc pl-5">
            {asistenciaPorDia.map((item, i) => (
              <li key={i}>{item.dia} - {item.porcentaje}%</li>
            ))}
          </ul>
        )}
      </div>

      {/* Animales Reincidentes */}
      <div className="p-4 bg-white rounded shadow">
        <h3 className="font-bold mb-2">Animales Reincidentes</h3>
        {topReincidentes.length === 0 ? (
          <p className="italic text-gray-600">No hay datos.</p>
        ) : (
          <ul className="list-disc pl-5">
            {topReincidentes.map((animal, i) => (
              <li key={i}>{animal.codigo} - {animal.faltas} faltas</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
