import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import QRScannerApp from '../pages/Barcodescanner';

const CoutingPresenceForm = () => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [asignaciones, setAsignaciones] = useState([]);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);
  const [codigosEscaneados, setCodigosEscaneados] = useState([]);
  const [escanerActivo, setEscanerActivo] = useState(false);
  const [horaFinalizacion, setHoraFinalizacion] = useState(null);
  const [scannerKey, setScannerKey] = useState(0);
  const [resumenVisible, setResumenVisible] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    axios.get('http://localhost:8000/asignar/horarios/')
      .then(res => {
        const filtradas = filtrarAsignacionesPorHorario(res.data);
        setAsignaciones(filtradas);
      })
      .catch(err => console.error('Error al cargar asignaciones:', err));
  }, []);

  const filtrarAsignacionesPorHorario = (asignacionesRaw) => {
    const ahora = new Date();

    return asignacionesRaw.filter(asignacion => {
      if (!asignacion.horario) return false;

      const [horaInicioStr, horaFinStr] = asignacion.horario.split('-').map(h => h.trim());
      const [hInicio, mInicio] = horaInicioStr.split(':').map(Number);
      const [hFin, mFin] = horaFinStr.split(':').map(Number);

      const inicio = new Date(ahora);
      inicio.setHours(hInicio, mInicio, 0, 0);

      const fin = new Date(ahora);
      fin.setHours(hFin, mFin, 0, 0);

      const margenMinutosMs = 15 * 60 * 1000;
      const ahoraMs = ahora.getTime();

      const dentroIngreso = ahoraMs >= inicio.getTime() && ahoraMs <= inicio.getTime() + margenMinutosMs;
      const dentroEgreso = ahoraMs >= fin.getTime() && ahoraMs <= fin.getTime() + margenMinutosMs;

      return dentroIngreso || dentroEgreso;
    });
  };


  const manejarCodigosDetectados = (codigos) => {
    const codigosNormalizados = codigos.map(c => c.trim().toUpperCase());
    setCodigosEscaneados(codigosNormalizados);
  };

  const manejarSeleccionAsignacion = (e) => {
    const idSeleccionado = e.target.value;
    const asignacion = asignaciones.find(a => a.id.toString() === idSeleccionado);
    setAsignacionSeleccionada(asignacion);
    setCodigosEscaneados([]);
    setHoraFinalizacion(null);
    setResumenVisible(false);
    setScannerKey(prev => prev + 1);
    setEscanerActivo(true);
  };

  const finalizarEscaneo = async () => {
    const hora = new Date();
    setHoraFinalizacion(hora);
    setEscanerActivo(false);
    setResumenVisible(true);

    const [horaInicioStr, horaFinStr] = asignacionSeleccionada.horario.split('-').map(h => h.trim());
    const [hInicio, mInicio] = horaInicioStr.split(':').map(Number);
    const [hFin, mFin] = horaFinStr.split(':').map(Number);

    const inicio = new Date(hora);
    inicio.setHours(hInicio, mInicio, 0, 0);

    const fin = new Date(hora);
    fin.setHours(hFin, mFin, 0, 0);

    const treintaMinMs = 30 * 60 * 1000;
    let tipo = 'desconocido';

    if (hora.getTime() - inicio.getTime() <= treintaMinMs) {
      tipo = 'ingreso';
    } else if (fin.getTime() - hora.getTime() <= treintaMinMs) {
      tipo = 'egreso';
    }

    const codigosValidos = codigosEscaneados.filter(c =>
      asignacionSeleccionada.codigos.includes(c)
    );
    const codigosFaltantes = asignacionSeleccionada.codigos.filter(
      c => !codigosEscaneados.includes(c)
    );

    try {
      await axios.post('http://localhost:8000/existencia/crear/', {
        zona: asignacionSeleccionada.zona,
        dias: asignacionSeleccionada.dias,
        horario: asignacionSeleccionada.horario,
        responsable: user?.displayName || 'Desconocido',
        hora_finalizacion: hora.toISOString(),
        codigos_escaneados: codigosEscaneados,
        codigos_validos: codigosValidos,
        codigos_faltantes: codigosFaltantes,
        codigo_asignacion: asignacionSeleccionada.codigo_asignacion,
        tipo: tipo
      });
    } catch (error) {
      console.error('Error al registrar existencia:', error);
      alert('Error al guardar la existencia.');
    }
  };

  const reiniciarPagina = () => {
    window.location.reload();
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-600 font-semibold space-x-2">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
        <span>Cargando autenticación...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {!asignacionSeleccionada && (
        <>
          <h2 className="text-2xl font-semibold mb-4">Seleccione una asignación</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {asignaciones.length === 0 && (
              <p className="text-center text-gray-500 col-span-full">No hay asignaciones activas.</p>
            )}
            {asignaciones.map(a => (
              <button
                key={a.id}
                value={a.id}
                onClick={manejarSeleccionAsignacion}
                className={`border rounded-lg p-4 text-left cursor-pointer transition 
                  ${asignacionSeleccionada?.id === a.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
              >
                <h3 className="font-semibold text-lg text-gray-800 mb-2">Zona: {a.zona}</h3>
                <p className="text-gray-600"><strong>Días:</strong> {a.dias.join(', ')}</p>
                <p className="text-gray-600"><strong>Horario:</strong> {a.horario}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {asignacionSeleccionada && escanerActivo && (
        <>
          <QRScannerApp key={scannerKey} onCodesDetected={manejarCodigosDetectados} />
          <button
            onClick={finalizarEscaneo}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Finalizar escaneo
          </button>
        </>
      )}

      {asignacionSeleccionada && !escanerActivo && resumenVisible && (
        <div className="p-4 bg-yellow-50 border border-yellow-400 rounded mt-6">
          <h3 className="text-xl font-semibold mb-3">Resumen de escaneo</h3>
          <p><strong>Zona:</strong> {asignacionSeleccionada.zona}</p>
          <p><strong>Días:</strong> {asignacionSeleccionada.dias?.join(', ')}</p>
          <p><strong>Horario:</strong> {asignacionSeleccionada.horario}</p>
          <p><strong>Responsable:</strong> {user?.displayName || "Desconocido"}</p>
          <p><strong>Hora finalización:</strong> {horaFinalizacion?.toLocaleString()}</p>

          <div className="my-4 p-3 bg-white rounded border border-gray-300">
            <h4 className="font-semibold mb-2">Códigos escaneados:</h4>
            <ul className="list-disc list-inside max-h-48 overflow-y-auto">
              {codigosEscaneados.map((c, i) => {
                const esValido = asignacionSeleccionada.codigos.includes(c);
                return (
                  <li key={i} className={esValido ? "text-green-700 font-semibold" : "text-red-600 line-through"}>
                    {c} {esValido ? "(Válido)" : "(No pertenece a la asignación)"}
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            onClick={reiniciarPagina}
            className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded w-full"
          >
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default CoutingPresenceForm;
