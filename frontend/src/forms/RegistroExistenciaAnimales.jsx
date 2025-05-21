import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from "firebase/auth";

const CoutingPresenceForm = () => {
  const [formData, setFormData] = useState({
    lugar: '',
    species: '',
    animal: '',
    codigo: '',
    nombreRegistro: ''
  });

  const [speciesOptions, setSpeciesOptions] = useState({});

  useEffect(() => {
    // Primero intenta cargar nombreRegistro desde sessionStorage
    const storedName = sessionStorage.getItem('nombreRegistro');
    if (storedName) {
      setFormData(prev => ({ ...prev, nombreRegistro: storedName }));
      return; // ya tenemos el nombre, no buscamos más
    }

    // Si no está en sessionStorage, esperamos a que Firebase cargue el usuario
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.displayName) {
        sessionStorage.setItem('nombreRegistro', user.displayName);
        setFormData(prev => ({ ...prev, nombreRegistro: user.displayName }));
      }
    });

    // Cleanup para evitar fugas de memoria
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/animales/')
      .then(response => {
        if (response.data && response.data.animales) {
          setSpeciesOptions(response.data.animales);
        }
      })
      .catch(error => {
        console.error('Error al obtener especies:', error);
      });
  }, []);

  const animalOptions = formData.species
    ? Object.keys(speciesOptions[formData.species] || {}).filter(k => k !== 'registro')
    : [];

  const handleChange = (e) => {
    const { id, value } = e.target;

    if (id === "codigo") {
      let raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '');

      if (raw.length <= 2) {
        setFormData(prev => ({ ...prev, [id]: raw }));
      } else if (raw.length <= 5) {
        const prefix = raw.slice(0, 2);
        const digits = raw.slice(2, 5);
        const formatted = `${prefix}-${digits}`;
        setFormData(prev => ({ ...prev, [id]: formatted }));
      }

      return;
    }

    setFormData(prev => ({
      ...prev,
      [id]: value,
      ...(id === 'species' ? { animal: '' } : {})
    }));
  };

  return (
    <div className="p-6 space-y-6">
      <section className="border p-4 rounded-lg shadow-md bg-white max-w-xl space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">Lugar</label>
            <select
              id="lugar"
              value={formData.lugar}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
            >
              <option value="">Seleccione una zona</option>
              <option value="ZonaNorte">Zona Norte</option>
              <option value="ZonaCentro">Zona Centro</option>
              <option value="ZonaSur">Zona Sur</option>
            </select>
          </div>

          <div>
            <label htmlFor="species" className="block text-sm font-medium text-gray-700">Especie</label>
            <select
              id="species"
              value={formData.species}
              onChange={handleChange}
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
            >
              <option value="">Seleccione especie</option>
              {Object.keys(speciesOptions).map(specie => (
                <option key={specie} value={specie}>{specie}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="animal" className="block text-sm font-medium text-gray-700">Animal</label>
            <select
              id="animal"
              value={formData.animal}
              onChange={handleChange}
              disabled={!formData.species}
              className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
            >
              <option value="">Seleccione animal</option>
              {animalOptions.map(animal => (
                <option key={animal} value={animal}>{animal}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="codigo" className="block text-sm font-medium">Código</label>
            <input
              type="text"
              id="codigo"
              value={formData.codigo}
              onChange={handleChange}
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
      </section>
    </div>
  );
};

export default CoutingPresenceForm;
