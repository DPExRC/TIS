import React, { useState, useEffect } from 'react';
import axios from 'axios';

const animalCodes = {
    "Vaca": 1000,
    "Toro": 2000,
    "Ternero": 3000,
    "Cerdos": 1000,
    "Lechones": 2000,
    "Cabras": 1000,
    "Corderos": 1000,
    "Ovejas": 2000,
    "Caballos": 1000,
    "Burro": 2000,
    "Gallinas": 1000,
    "Gallos": 2000,
    "Gansos": 3000,
    "Pavos": 4000,
    "Pato": 1000,
    "Pata": 2000,
    "Oveja merina": 1000,
    "Carnero": 2000
};

const RegisterAnimalsForm = () => {
    const [formData, setFormData] = useState({
        species: '',
        animal: '',
        birthday: '',
        code: ''
    });

    const [codeGenerated, setCodeGenerated] = useState(false);
    const [speciesOptions, setSpeciesOptions] = useState({});

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

    useEffect(() => {
        if (formData.species && formData.animal) {
            const speciesPrefix = formData.species.substring(0, 2).toUpperCase();
            const baseCode = animalCodes[formData.animal] || 0;

            if (baseCode) {
                const generatedCode = `${speciesPrefix}-${baseCode}`;
                setFormData(prev => ({ ...prev, code: generatedCode }));
                setCodeGenerated(true);
            }
        } else {
            setCodeGenerated(false);
            setFormData(prev => ({ ...prev, code: '' }));
        }
    }, [formData.species, formData.animal]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'species') {
            setFormData({ ...formData, species: value, animal: '' });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            const response = await axios.post('http://127.0.0.1:8000/registro-animales/', formData);
            console.log('Animal registrado exitosamente:', response.data);
            // Opcional: limpiar formulario
            setFormData({ species: '', animal: '', birthday: '', code: '' });
            setCodeGenerated(false);
        } catch (error) {
            console.error('Error al registrar animal:', error);
        }
    };
    

    const animalOptions = speciesOptions[formData.species] || [];

    return (
        <form onSubmit={handleSubmit} >
            <div>
                <label htmlFor="species">Especie:</label>
                <select
                    id="species"
                    name="species"
                    value={formData.species}
                    onChange={handleChange}
                    required
                >
                    <option value="">Seleccione una especie</option>
                    {Object.keys(speciesOptions).map((specie) => (
                    <option key={specie} value={specie} style={{ color: 'black' }}>
                        {specie}
                    </option>
                ))}

                </select>
            </div>

            <div>
                <label htmlFor="animal">Animal: </label>
                <select
                    id="animal"
                    name="animal"
                    value={formData.animal}
                    onChange={handleChange}
                    required
                    disabled={!formData.species}
                >
                    <option value="">Seleccione un animal</option>
                    {animalOptions.map((animal) => (
                        <option key={animal} value={animal} style={{ color: 'black' }}>
                            {animal}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label htmlFor="birthday">Fecha de nacimiento: </label>
                <input
                    type="date"
                    id="birthday"
                    name="birthday"
                    value={formData.birthday}
                    onChange={handleChange}
                    required
                />
            </div>

            <div>
                <label htmlFor="code">Código generado: </label>
                <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    readOnly
                />
            </div>

            {!codeGenerated ? (
                <p>Seleccione especie y animal para generar código</p>
            ) : (
                <button type="submit">Registrar</button>
            )}
        </form>
    );
};

export default RegisterAnimalsForm;
