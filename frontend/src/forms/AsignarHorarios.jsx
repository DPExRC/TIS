import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Select from 'react-select';
import 'react-toastify/dist/ReactToastify.css';

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const generarCodigoUnico = () => {
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alfanumerico = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  let codigo = '';
  for (let i = 0; i < 7; i++) {
    codigo += alfanumerico.charAt(Math.floor(Math.random() * alfanumerico.length));
  }

  const ultimaLetra = letras.charAt(Math.floor(Math.random() * letras.length));
  return codigo + ultimaLetra;
};

const AsignarHorarios = () => {
  const [formData, setFormData] = useState({
    especie: '',
    animal: '',
    codigos: [],
    zona: '',
    horario: ''
  });

  const [todosAnimales, setTodosAnimales] = useState([]);
  const [zonasDisponibles, setZonasDisponibles] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const especiesUnicas = [...new Set(todosAnimales.map(a => a.especie))];
  const animalesFiltrados = formData.especie
    ? todosAnimales.filter(a => a.especie === formData.especie)
    : todosAnimales;
  const animalesUnicos = [...new Set(animalesFiltrados.map(a => a.animal))];

  const codigosFiltrados = todosAnimales.filter(a =>
    (!formData.especie || a.especie === formData.especie) &&
    (!formData.animal || a.animal === formData.animal)
  ).map(a => ({ value: a.codigo, label: `${a.codigo} (${a.animal})` }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resAnimales, resZonas, resHorarios] = await Promise.all([
          axios.get('http://localhost:8000/animales/total/'),
          axios.get('http://localhost:8000/zonas/list/'),
          axios.get('http://localhost:8000/horarios/listar/')
        ]);
        setTodosAnimales(resAnimales.data || []);
        setZonasDisponibles(resZonas.data || []);
        setHorariosDisponibles(resHorarios.data || []);
      } catch (err) {
        console.error('Error al cargar datos:', err);
      }
    };
    fetchData();
  }, []);

  const toggleDia = (dia) => {
    setDiasSeleccionados(prev =>
      prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.horario || !formData.zona || diasSeleccionados.length === 0) {
      setErrorMsg("Complete todos los campos obligatorios y seleccione al menos un día.");
      return;
    }

    let codigos = formData.codigos;

    if (codigos.length === 0 && (formData.especie || formData.animal)) {
      codigos = codigosFiltrados.map(c => c.value);
    }

    if (codigos.length === 0) {
      setErrorMsg("Debe seleccionar al menos un código, una especie o un animal.");
      return;
    }

    const codigoUnico = generarCodigoUnico();

    const payload = {
      codigos: codigos,
      zona: formData.zona,
      horario: formData.horario,
      dias: diasSeleccionados,
      codigo_asignacion: codigoUnico
    };

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await axios.post('http://localhost:8000/asignar/horarios/', payload);

      toast.success(
        <div>
          <strong>Horario Asignado</strong><br />
          <strong>Zona:</strong> {formData.zona}<br />
          <strong>Horario:</strong> {formData.horario}<br />
          <strong>Días:</strong> {diasSeleccionados.join(', ')}<br />
          <strong>Códigos:</strong> {codigos.join(', ')}<br />
          <strong>ID Asignación:</strong> {codigoUnico}
        </div>,
        { autoClose: 6000, position: 'top-right' }
      );

      setFormData({ especie: '', animal: '', codigos: [], zona: '', horario: '' });
      setDiasSeleccionados([]);
    } catch (err) {
      console.error('Error al asignar:', err);
      setErrorMsg('Error al asignar horario. Verifique los datos.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white text-black shadow-md rounded-xl p-6 relative">
      <ToastContainer />
      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block text-sm font-medium mb-1">Especie (opcional)</label>
          <select
            name="especie"
            value={formData.especie}
            onChange={(e) => setFormData({ ...formData, especie: e.target.value, animal: '', codigos: [] })}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todas</option>
            {especiesUnicas.map((e, i) => (
              <option key={i} value={e}>{e}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Animal (opcional)</label>
          <select
            name="animal"
            value={formData.animal}
            onChange={(e) => setFormData({ ...formData, animal: e.target.value, codigos: [] })}
            disabled={!formData.especie && animalesUnicos.length === 0}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Todos</option>
            {animalesUnicos.map((a, i) => (
              <option key={i} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Códigos (opcional)</label>
          <Select
            isMulti
            name="codigos"
            options={codigosFiltrados}
            value={formData.codigos.map(c => ({ value: c, label: c }))}
            onChange={(selected) =>
              setFormData({ ...formData, codigos: selected.map(opt => opt.value) })
            }
            placeholder="Buscar y seleccionar códigos"
            className="react-select-container"
            classNamePrefix="select"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Zona</label>
          <select
            name="zona"
            value={formData.zona}
            onChange={(e) => setFormData({ ...formData, zona: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Seleccione una zona</option>
            {zonasDisponibles.map((z, i) => (
              <option key={i} value={z}>{z}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Días</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {diasSemana.map((dia) => (
              <button
                key={dia}
                type="button"
                className={`px-4 py-2 rounded-full border transition ${
                  diasSeleccionados.includes(dia)
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white text-gray-800 border-gray-300'
                }`}
                onClick={() => toggleDia(dia)}
                disabled={isSubmitting}
              >
                {dia}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Horario</label>
          <select
            name="horario"
            value={formData.horario}
            onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            required
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Seleccione un horario</option>
            {horariosDisponibles.map((h, i) => (
              <option key={i} value={h.horario}>
                {h.nombre} / {h.horario}
              </option>
            ))}
          </select>
        </div>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          className={`w-full py-2 px-4 rounded transition ${
            isSubmitting ? 'bg-gray-400 cursor-wait text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Asignando...' : 'Asignar Horario'}
        </button>
      </form>
    </div>
  );
};

export default AsignarHorarios;
