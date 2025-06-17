import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "../components/Card";
import { BrowserMultiFormatReader } from "@zxing/library";

const CameraBarcodeScanner = () => {
  const videoRef = useRef(null);
  const [scanner, setScanner] = useState(new BrowserMultiFormatReader());
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [lastScan, setLastScan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initDevices = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === "videoinput");
        setVideoDevices(videoInputs);

        const defaultDevice = videoInputs.find(d => d.label.toLowerCase().includes("back")) || videoInputs[0];
        if (defaultDevice) {
          setSelectedDeviceId(defaultDevice.deviceId);
          setIsFrontCamera(!defaultDevice.label.toLowerCase().includes("back"));
        }
      } catch (err) {
        console.error(err);
        setError("No se detectaron cámaras.");
      }
    };

    initDevices();
  }, []);

  useEffect(() => {
    if (!selectedDeviceId || !videoRef.current) return;

    scanner.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
      if (result) {
        handleCodeScanned(result.getText());
      }
    });

    return () => {
      scanner.reset();
    };
  }, [selectedDeviceId]);

  const handleCodeScanned = (codigo) => {
    if (!codigo || lastScan?.codigo === codigo) return;

    axios
      .post("http://127.0.0.1:8000/api/animales/escanear/", { codigo })
      .then((res) => {
        setLastScan(res.data);
        setError(null);
      })
      .catch((err) => {
        setError(err.response?.data?.error || "Error de conexión");
        setLastScan(null);
      });
  };

  const toggleCamera = () => {
    if (videoDevices.length < 2) return;
    const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setSelectedDeviceId(videoDevices[nextIndex].deviceId);
    setIsFrontCamera(!videoDevices[nextIndex].label.toLowerCase().includes("back"));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Escáner con Cámara</h2>

      <div className="border rounded shadow overflow-hidden mb-4">
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "auto",
            transform: isFrontCamera ? "scaleX(-1)" : "none",
          }}
          muted
          autoPlay
          playsInline
        />
      </div>

      <button
        onClick={toggleCamera}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Cambiar Cámara
      </button>

      {lastScan && (
        <Card className="mb-4 border-green-400">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-green-700">Resultado</h3>
            <p><strong>Código:</strong> {lastScan.codigo}</p>
            <p><strong>Especie:</strong> {lastScan.especie}</p>
            <p><strong>Nombre:</strong> {lastScan.nombre}</p>
            <p><strong>Estado:</strong> {lastScan.estado}</p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-4 border-red-400">
          <CardContent className="p-4 text-red-600">
            <strong>Error:</strong> {error}
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-gray-500">
        Escanea un código apuntando la cámara correctamente. Si el video se ve al revés, cambia de cámara.
      </p>
    </div>
  );
};

export default CameraBarcodeScanner;
