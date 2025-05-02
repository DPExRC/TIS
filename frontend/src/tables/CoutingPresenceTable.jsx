
const AnimalCountTable = () => {
  const data = [
    { lugar: "Zona Norte", especie: "Bovino", animal: "Vaca", actual: 47, total: 50 },
    { lugar: "Zona Sur", especie: "Aves", animal: "Pato", actual: 30, total: 30 },
    { lugar: "Zona Este", especie: "Porcino", animal: "Cerdo", actual: 19, total: 20 },
    { lugar: "Zona Norte", especie: "Bovino", animal: "Toro", actual: 10, total: 12 },
  ];

  const calcularDiferencia = (actual, total) => total - actual;

  return (
    <div>
      <div className="p-6 space-y-6">

        <section>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-gray-200 text-gray-700 text-sm">
                <tr>
                  <th className="px-4 py-2 text-left">Lugar</th>
                  <th className="px-4 py-2 text-left">Especie</th>
                  <th className="px-4 py-2 text-left">Animal</th>
                  <th className="px-4 py-2 text-right">Actual</th>
                  <th className="px-4 py-2 text-right">Total</th>
                  <th className="px-4 py-2 text-right">Diferencia</th>
                </tr>
              </thead>
              <tbody>
                {data.map((registro, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50 text-black">
                    <td className="px-4 py-2">{registro.lugar}</td>
                    <td className="px-4 py-2">{registro.especie}</td>
                    <td className="px-4 py-2">{registro.animal}</td>
                    <td className="px-4 py-2 text-right">{registro.actual}</td>
                    <td className="px-4 py-2 text-right">{registro.total}</td>
                    <td className="px-4 py-2 text-right">
                      {calcularDiferencia(registro.actual, registro.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnimalCountTable;
