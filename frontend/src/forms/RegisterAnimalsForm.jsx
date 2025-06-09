import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../styles/RegisterAnimalsForm.css";

const RegisterAnimalsForm = () => {
  const [formData, setFormData] = useState({
    species: '',
    animal: '',
    birthday: '',
    code: ''
  });

  const [codeGenerated, setCodeGenerated] = useState(false);
  const [speciesOptions, setSpeciesOptions] = useState({});
  const [codeMap, setCodeMap] = useState({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/animales/')
      .then(response => {
        if (response.data?.animales) {
          const data = response.data.animales;
          setSpeciesOptions(data);

          const generatedMap = {};
          for (const generalSpecies of Object.keys(data)) {
            const prefix = generalSpecies.substring(0, 2).toUpperCase();
            const subSpecies = Object.keys(data[generalSpecies]);
            generatedMap[generalSpecies] = {};

            subSpecies.forEach((animal, index) => {
              const base = (index + 1) * 1000;
              generatedMap[generalSpecies][animal] = {
                codeBase: base,
                prefix
              };
            });
          }

          setCodeMap(generatedMap);
        }
      })
      .catch(error => console.error('Error al obtener especies:', error));
  }, []);

  useEffect(() => {
    const { species, animal } = formData;
    if (species && animal) {
      const codeInfo = codeMap[species]?.[animal];
      if (codeInfo) {
        setFormData(prev => ({
          ...prev,
          code: `${codeInfo.prefix}-${codeInfo.codeBase}`
        }));
        setCodeGenerated(true);
        setErrorMsg('');
      } else {
        setFormData(prev => ({ ...prev, code: '' }));
        setCodeGenerated(false);
        setErrorMsg('El animal seleccionado no pertenece a la especie elegida.');
      }
    } else {
      setFormData(prev => ({ ...prev, code: '' }));
      setCodeGenerated(false);
      setErrorMsg('');
    }
  }, [formData.species, formData.animal, codeMap]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'species' ? { animal: '' } : {})
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/registro-animales/', formData);
      console.log('Animal registrado exitosamente:', response.data);
      setFormData({ species: '', animal: '', birthday: '', code: '' });
      setCodeGenerated(false);
      setErrorMsg('');
    } catch (error) {
      console.error('Error al registrar animal:', error);
    }
  };

  const animalOptions = speciesOptions[formData.species]
    ? Object.keys(speciesOptions[formData.species]).filter(key => key !== "registro")
    : [];

  return (
    <div className="max-w-xl mx-auto bg-white text-black shadow-md rounded-xl p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="species" className="block text-sm font-medium mb-1">Especie</label>
          <select
            id="species"
            name="species"
            value={formData.species}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          >
            <option value="">Seleccione una especie</option>
            {Object.keys(speciesOptions).map((specie) => (
              <option key={specie} value={specie}>{specie}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="animal" className="block text-sm font-medium mb-1">Animal</label>
          <select
            id="animal"
            name="animal"
            value={formData.animal}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
            disabled={!formData.species}
          >
            <option value="">Seleccione un animal</option>
            {animalOptions.map((animal) => (
              <option key={animal} value={animal}>{animal}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="birthday" className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            id="birthday"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-1">Código generado</label>
          <input
            type="text"
            id="code"
            name="code"
            value={formData.code}
            readOnly
            className="w-full p-2 border bg-gray-100 border-gray-300 rounded"
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        {formData.species && formData.animal && formData.birthday && codeGenerated ? (
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition"
          >
            Registrar
          </button>
        ) : (
          <p className="text-sm text-gray-500">Complete especie, animal y fecha para habilitar el registro.</p>
        )}
      </form>
    </div>
  );
};

export default RegisterAnimalsForm;
