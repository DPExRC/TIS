import { useState, useEffect } from "react";
import Navbar from "../components/NavBar";
import Sidebar from "../components/SideBar";
import { Card, CardContent } from "../components/Card";
import { Button } from "../components/Button";

const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const Horarios = () => {
  const [zonas, setZonas] = useState([]);
  const [especies] = useState(["Bovino", "Porcino", "Equino", "Ovino", "Caprino", "Aves"]);
  const [horarios, setHorarios] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);

  const [formAsignacion, setFormAsignacion] = useState({
    tipo: "individual",
    codigoIndividual: "",
    codigoInicio: "",
    codigoFin: "",
    especie: "",
    horarioSeleccionado: null,
  });

  const [formHorario, setFormHorario] = useState({
    zona: "",
    bloques: [
      {
        dias: [],
        horarios: [{ ingreso: "", egreso: "" }],
      },
    ],
  });

  useEffect(() => {
    const fetchZonas = async () => {
      try {
        const response = await fetch("http://localhost:8000/zonas/list/");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setZonas(data);
      } catch (error) {
        console.error("Error al cargar zonas:", error);
      }
    };
    fetchZonas();
  }, []);

  const agregarBloqueDia = () => {
    setFormHorario((prev) => ({
      ...prev,
      bloques: [...prev.bloques, { dias: [], horarios: [{ ingreso: "", egreso: "" }] }],
    }));
  };

  const agregarParHorario = (bloqueIndex) => {
    const nuevos = [...formHorario.bloques];
    nuevos[bloqueIndex].horarios.push({ ingreso: "", egreso: "" });
    setFormHorario({ ...formHorario, bloques: nuevos });
  };

  const handleDiaToggle = (bloqueIndex, dia) => {
    const nuevos = [...formHorario.bloques];
    const index = nuevos[bloqueIndex].dias.indexOf(dia);
    if (index >= 0) {
      nuevos[bloqueIndex].dias.splice(index, 1);
    } else {
      nuevos[bloqueIndex].dias.push(dia);
    }
    setFormHorario({ ...formHorario, bloques: nuevos });
  };

  const handleCambioHorario = (bloqueIndex, horarioIndex, campo, valor) => {
    const nuevos = [...formHorario.bloques];
    nuevos[bloqueIndex].horarios[horarioIndex][campo] = valor;
    setFormHorario({ ...formHorario, bloques: nuevos });
  };

  const guardarHorario = () => {
    if (
      formHorario.zona &&
      formHorario.bloques.every(
        (b) => b.dias.length && b.horarios.every((h) => h.ingreso && h.egreso)
      )
    ) {
      setHorarios([...horarios, { ...formHorario }]);
      setFormHorario({
        zona: "",
        bloques: [{ dias: [], horarios: [{ ingreso: "", egreso: "" }] }],
      });
    }
  };

  const generarCodigosRango = (inicio, fin) => {
    const resultados = [];
    const prefix = inicio.match(/^[a-zA-Z]+/)?.[0] || "";
    const suffix = inicio.match(/[a-zA-Z]+$/)?.[0] || "";

    const numInicio = parseInt(inicio.match(/\d+/)?.[0] || "0");
    const numFin = parseInt(fin.match(/\d+/)?.[0] || "0");

    const longitud = inicio.replace(/[^0-9]/g, "").length;

    for (let i = numInicio; i <= numFin; i++) {
      const numero = i.toString().padStart(longitud, "0");
      resultados.push(`${prefix}${numero}${suffix}`);
    }

    return resultados;
  };

  const asignarCodigos = () => {
    if (!formAsignacion.especie || formAsignacion.horarioSeleccionado === null) return;

    let codigos = [];

    if (formAsignacion.tipo === "individual") {
      if (!formAsignacion.codigoIndividual) return;
      codigos = [formAsignacion.codigoIndividual];
    } else {
      if (!formAsignacion.codigoInicio || !formAsignacion.codigoFin) return;
      codigos = generarCodigosRango(formAsignacion.codigoInicio, formAsignacion.codigoFin);
    }

    const nuevasAsignaciones = codigos.map((codigo) => ({
      codigo,
      especie: formAsignacion.especie,
      horario: horarios[formAsignacion.horarioSeleccionado],
    }));

    setAsignaciones((prev) => [...prev, ...nuevasAsignaciones]);

    setFormAsignacion({
      tipo: "individual",
      codigoIndividual: "",
      codigoInicio: "",
      codigoFin: "",
      especie: "",
      horarioSeleccionado: null,
    });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 md:ml-50">
        <Navbar />
        <div className="p-4 md:p-6 space-y-6 md:space-y-8 text-black">
          {/* CREAR HORARIOS */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-bold">1. Crear Horarios por Zona y Días</h2>

              <select
                className="w-full h-10 px-2 border rounded text-black bg-white"
                value={formHorario.zona}
                onChange={(e) => setFormHorario((prev) => ({ ...prev, zona: e.target.value }))}
              >
                <option value="" disabled className="text-black">
                  Seleccione una zona
                </option>
                {zonas.map((z, i) => (
                  <option key={i} value={z.nombre} className="text-black">
                    {z.nombre}
                  </option>
                ))}
              </select>

              {formHorario.bloques.map((bloque, bloqueIdx) => (
                <div key={bloqueIdx} className="border p-4 rounded-lg space-y-4 bg-gray-50">
                  <div>
                    <p className="font-medium mb-1">Días aplicables:</p>
                    <div className="flex flex-wrap gap-2">
                      {diasSemana.map((dia) => (
                        <button
                          key={dia}
                          className={`px-3 py-1 border rounded-full text-sm ${
                            bloque.dias.includes(dia) ? "bg-blue-600 text-white" : "bg-white text-black"
                          }`}
                          onClick={() => handleDiaToggle(bloqueIdx, dia)}
                          type="button"
                        >
                          {dia}
                        </button>
                      ))}
                    </div>
                  </div>

                  {bloque.horarios.map((h, horarioIdx) => (
                    <div key={horarioIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block mb-1 font-medium">Ingreso</label>
                        <input
                          type="time"
                          className="w-full h-10 border px-2 rounded-md"
                          value={h.ingreso}
                          onChange={(e) => handleCambioHorario(bloqueIdx, horarioIdx, "ingreso", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block mb-1 font-medium">Egreso</label>
                        <input
                          type="time"
                          className="w-full h-10 border px-2 rounded-md"
                          value={h.egreso}
                          onChange={(e) => handleCambioHorario(bloqueIdx, horarioIdx, "egreso", e.target.value)}
                        />
                      </div>
                    </div>
                  ))}

                  <Button onClick={() => agregarParHorario(bloqueIdx)}>+ Otro par ingreso/egreso</Button>
                </div>
              ))}

              <div className="flex flex-col md:flex-row gap-2">
                <Button onClick={agregarBloqueDia}>+ Agregar nuevo bloque de días</Button>
                <Button onClick={guardarHorario}>Guardar Horario</Button>
              </div>
            </CardContent>
          </Card>

          {/* ASIGNAR CÓDIGOS */}
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-lg font-bold">2. Asignar Códigos a Horarios</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 font-medium">Tipo de asignación</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formAsignacion.tipo === "individual"}
                        onChange={() => setFormAsignacion((prev) => ({ ...prev, tipo: "individual" }))}
                      />
                      Individual
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={formAsignacion.tipo === "rango"}
                        onChange={() => setFormAsignacion((prev) => ({ ...prev, tipo: "rango" }))}
                      />
                      Rango
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-medium">Especie</label>
                  <select
                    className="w-full h-10 px-2 border rounded text-black bg-white"
                    value={formAsignacion.especie}
                    onChange={(e) => setFormAsignacion((prev) => ({ ...prev, especie: e.target.value }))}
                  >
                    <option value="" disabled>
                      Seleccionar Especie
                    </option>
                    {especies.map((e, i) => (
                      <option key={i} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {formAsignacion.tipo === "individual" ? (
                <div>
                  <label className="block mb-1 font-medium">Código Animal</label>
                  <input
                    type="text"
                    className="w-full h-10 border px-2 rounded-md"
                    value={formAsignacion.codigoIndividual}
                    onChange={(e) => setFormAsignacion((prev) => ({ ...prev, codigoIndividual: e.target.value }))}
                    placeholder="Ej: va-001"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1 font-medium">Código Inicial</label>
                    <input
                      type="text"
                      className="w-full h-10 border px-2 rounded-md"
                      value={formAsignacion.codigoInicio}
                      onChange={(e) => setFormAsignacion((prev) => ({ ...prev, codigoInicio: e.target.value }))}
                      placeholder="Ej: va-001"
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-medium">Código Final</label>
                    <input
                      type="text"
                      className="w-full h-10 border px-2 rounded-md"
                      value={formAsignacion.codigoFin}
                      onChange={(e) => setFormAsignacion((prev) => ({ ...prev, codigoFin: e.target.value }))}
                      placeholder="Ej: va-015"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block mb-1 font-medium">Horario</label>
                <select
                  className="w-full h-10 px-2 border rounded text-black bg-white"
                  value={formAsignacion.horarioSeleccionado !== null ? String(formAsignacion.horarioSeleccionado) : ""}
                  onChange={(e) =>
                    setFormAsignacion((prev) => ({
                      ...prev,
                      horarioSeleccionado: e.target.value !== "" ? parseInt(e.target.value) : null,
                    }))
                  }
                >
                  <option value="" disabled>
                    Seleccionar Horario
                  </option>
                  {horarios.map((h, i) => (
                    <option key={i} value={String(i)}>
                      {h.zona} ({h.bloques.length} días)
                    </option>
                  ))}
                </select>
              </div>

              <Button onClick={asignarCodigos}>Asignar Código(s)</Button>
            </CardContent>
          </Card>

          {/* VER ASIGNACIONES */}
          <Card>
            <CardContent>
              <h2 className="text-lg font-bold mb-4">Asignaciones Registradas</h2>
              <div className="overflow-x-auto">
                <table className="w-full table-auto border text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border px-3 py-2">Código</th>
                      <th className="border px-3 py-2">Especie</th>
                      <th className="border px-3 py-2">Zona</th>
                      <th className="border px-3 py-2">Día</th>
                      <th className="border px-3 py-2">Ingreso</th>
                      <th className="border px-3 py-2">Egreso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asignaciones.flatMap((a, idx) =>
                      a.horario.bloques.flatMap((b, bi) =>
                        b.dias.flatMap((dia) =>
                          b.horarios.map((h, hi) => (
                            <tr key={`${idx}-${bi}-${hi}`} className="even:bg-gray-50">
                              <td className="border px-3 py-2">{a.codigo}</td>
                              <td className="border px-3 py-2">{a.especie}</td>
                              <td className="border px-3 py-2">{a.horario.zona}</td>
                              <td className="border px-3 py-2">{dia}</td>
                              <td className="border px-3 py-2">{h.ingreso}</td>
                              <td className="border px-3 py-2">{h.egreso}</td>
                            </tr>
                          ))
                        )
                      )
                    )}
                    {asignaciones.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-4 text-gray-500">
                          Sin asignaciones aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Horarios;
