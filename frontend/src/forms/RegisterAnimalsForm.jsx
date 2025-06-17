import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RegisterAnimalsForm = () => {
  const [formData, setFormData] = useState({
    especie: '',
    animal: '',
    fecha_nacimiento: '',
    codigo: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const mostrarNotificacion = (datos) => {
    toast.success(
      <div>
        <strong>Animal registrado:</strong><br />
        Código: {datos.codigo}<br />
        Especie: {datos.especie}<br />
        Animal: {datos.animal}<br />
        Fecha Nacimiento: {datos.fecha_nacimiento}
      </div>,
      {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const { especie, animal, fecha_nacimiento } = formData;

      const response = await axios.post('http://127.0.0.1:8000/animales/registrar/', {
        especie,
        animal,
        fecha_nacimiento
      });

      const codigoGenerado = response.data.codigo;

      const datosRegistrados = {
        ...formData,
        codigo: codigoGenerado
      };

      setFormData({
        especie: '',
        animal: '',
        fecha_nacimiento: '',
        codigo: ''
      });

      mostrarNotificacion(datosRegistrados);
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Error al registrar. Verifica los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white text-black shadow-md rounded-xl p-6 relative">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="especie" className="block text-sm font-medium mb-1">Especie</label>
          <input
            type="text"
            id="especie"
            name="especie"
            value={formData.especie}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="animal" className="block text-sm font-medium mb-1">Animal</label>
          <input
            type="text"
            id="animal"
            name="animal"
            value={formData.animal}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        <div>
          <label htmlFor="fecha_nacimiento" className="block text-sm font-medium mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            id="fecha_nacimiento"
            name="fecha_nacimiento"
            value={formData.fecha_nacimiento}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            required
          />
        </div>

        {errorMsg && (
          <p className="text-sm text-red-600">{errorMsg}</p>
        )}

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded transition 
            ${isSubmitting ? 'bg-gray-400 cursor-wait text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
};

export default RegisterAnimalsForm;
