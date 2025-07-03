import React, { useEffect, useState } from 'react';

const TablaTotalHorarios = () => {
  const [asignaciones, setAsignaciones] = useState([]);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    const fetchAsignaciones = async () => {
      try {
        const res = await fetch('http://localhost:8000/asignar/horarios/');
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        const data = await res.json();
        setAsignaciones(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAsignaciones();
  }, []);

  const chunkArray = (arr, size) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  const filtrarBusqueda = (datos) => {
    const query = busqueda.toLowerCase();
    return datos.filter(item =>
      item.zona.toLowerCase().includes(query) ||
      item.dias.some(dia => dia.toLowerCase().includes(query)) ||
      item.codigos.some(cod => cod.toLowerCase().includes(query))
    );
  };

  const agruparPorZona = (datos) => {
    return datos.reduce((acc, item) => {
      const { zona } = item;
      if (!acc[zona]) acc[zona] = [];
      acc[zona].push(item);
      return acc;
    }, {});
  };

  if (error) {
    return <p className="text-red-600 font-semibold">Error: {error}</p>;
  }

  const asignacionesFiltradas = filtrarBusqueda(asignaciones);
  const asignacionesPorZona = agruparPorZona(asignacionesFiltradas);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por zona, código o día..."
          className="w-full md:w-1/3 p-2 border border-gray-300 rounded"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div className="space-y-10">
        {Object.entries(asignacionesPorZona).map(([zona, items]) => (
          <div key={zona} className="border rounded-lg shadow-md overflow-hidden">
            <div className="bg-blue-900 text-white px-5 py-3 font-semibold text-lg">
              Zona: {zona}
            </div>
            <div className="divide-y divide-gray-200">
              {items.map((item, i) => (
                <div key={`${zona}-${i}`} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-800">
                    <div>
                      <p className="font-semibold mb-1">Códigos:</p>
                      {chunkArray(item.codigos, 6).map((grupo, idx) => (
                        <div key={idx}>{grupo.join(', ')}</div>
                      ))}
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Horario:</p>
                      <p>{item.horario}</p>
                    </div>
                    <div>
                      <p className="font-semibold mb-1">Días:</p>
                      <p>{item.dias.join(', ')}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TablaTotalHorarios;
