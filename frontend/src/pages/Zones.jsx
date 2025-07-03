import { useState, useEffect } from "react";
import { ZonesTable } from "../tables/TablaZonas";
import BaseLayout from "../components/BaseLayout";

const Zones = () => {
  const [zones, setZones] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editedZone, setEditedZone] = useState("");

  const fetchZones = async () => {
    try {
      const res = await fetch("http://localhost:8000/zonas/list/");
      const data = await res.json();
      setZones(data);
    } catch (error) {
      console.error("Error al obtener zonas:", error);
    }
  };

  const handleAddZone = async () => {
    // Aquí va la implementación existente para agregar zona
  };

  useEffect(() => {
    fetchZones();
  }, []);

  return (
    <BaseLayout title="Zonas">
      <ZonesTable
        zones={zones}
        onAddZone={handleAddZone}
        editIndex={editIndex}
        setEditIndex={setEditIndex}
        editedZone={editedZone}
        setEditedZone={setEditedZone}
        fetchZones={fetchZones}
      />
    </BaseLayout>
  );
};

export default Zones;
