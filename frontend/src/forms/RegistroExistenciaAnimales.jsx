import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CoutingPresenceForm = () => {
  const [formData, setFormData] = useState({
    lugar: '',
    codigo: '',
    nombreRegistro: ''
  });

  useEffect(() => {
    const storedName = sessionStorage.getItem('nombreRegistro');
    if (storedName) {
      setFormData(prev => ({ ...prev, nombreRegistro: storedName }));
      return;
    }

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        sessionStorage.setItem('nombreRegistro', user.displayName);
        setFormData(prev => ({ ...prev, nombreRegistro: user.displayName }));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "codigo") {
      const formattedCodes = value
        .toUpperCase()
        .split(',')
        .map(code => {
          const raw = code.replace(/[^A-Z0-9]/g, '');
          if (raw.length <= 2) return raw;
          if (raw.length <= 6) {
            const prefix = raw.slice(0, 2);
            const digits = raw.slice(2, 6);
            return `${prefix}-${digits}`;
          }
          return raw.slice(0, 2) + '-' + raw.slice(2, 6);
        })
        .join(', ');
      setFormData(prev => ({ ...prev, codigo: formattedCodes }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async () => {
    const { lugar, codigo, nombreRegistro } = formData;

    if (!lugar || !codigo || !nombreRegistro) {
      alert('Por favor complete todos los campos requeridos.');
      return;
    }

    const codigos = codigo
      .split(',')
      .map(c => c.trim().toUpperCase())
      .filter(c => /^[A-Z]{2}-\d{1,4}$/.test(c));

    if (codigos.length === 0) {
      alert("Debe ingresar al menos un código válido en formato XX-1234.");
      return;
    }

    try {
      for (const cod of codigos) {
        const payload = {
          zona: lugar,
          codigo: cod,
          RegistradoPor: nombreRegistro
        };

        const response = await axios.post('http://127.0.0.1:8000/registrar-existencia/', payload);

        if (response.status === 201) {
          console.log(`Código ${cod} registrado correctamente.`);
        }
      }

      alert("Todos los códigos fueron registrados exitosamente.");
      setFormData(prev => ({ ...prev, codigo: '' }));

    } catch (error) {
      console.error('Error al registrar existencia:', error);
      alert(
        error.response?.data?.error ||
        'Ocurrió un error al registrar el/los código(s). Intente nuevamente.'
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      <section className="border p-4 rounded-lg shadow-md bg-white max-w-xl space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">Zona</label>
            <select
              id="lugar"
              value={formData.lugar}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
            >
              <option value="">Seleccione una zona</option>
              <option value="Norte">Norte</option>
              <option value="Centro">Centro</option>
              <option value="Sur">Sur</option>
            </select>
          </div>

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium">Códigos (separados por coma)</label>
            <input
              type="text"
              id="codigo"
              value={formData.codigo}
              onChange={handleChange}
              placeholder="Ej: VA-0001, PA-0023"
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
            />
          </div>

          <div>
            <label htmlFor="nombreRegistro" className="block text-sm font-medium text-gray-700">
              Registrado por:
            </label>
            <input
              type="text"
              id="nombreRegistro"
              name="nombreRegistro"
              value={formData.nombreRegistro}
              readOnly
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
            />
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
        >
          Registrar Existencia
        </button>
      </section>
    </div>
  );
};

export default CoutingPresenceForm;
