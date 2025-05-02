const CoutingPresenceForm = () => {
    return (
      <div>
        <div className="p-6 space-y-6">
  
          <section className="border p-4 rounded-lg shadow-md bg-white max-w-xl space-y-4">
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
                <input
                  type="date"
                  value="2025-04-19"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de término</label>
                <input
                  type="date"
                  value="2025-04-19"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
                <input
                  type="time"
                  value="06:00"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de término</label>
                <input
                  type="time"
                  value="18:00"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
  
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Lugar</label>
                <input
                  type="text"
                  value="Zona Norte - Establo 3"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Último registro</label>
                <input
                  type="datetime-local"
                  value="2025-04-19T17:45"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700">Registrado por</label>
                <input
                  type="text"
                  value="Juan Pérez"
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  };
  
  export default CoutingPresenceForm;
  