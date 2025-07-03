import React, { useRef, useEffect, useState } from 'react';
import jsQR from 'jsqr';

const MultiQRScanner = ({ onNewCode, maxCodes = 10, activo = true }) => {
  // Referencias para elementos del DOM y recursos
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  // Estados del componente
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [videoDevices, setVideoDevices] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 400, height: 300 });

  // Referencias para recursos que necesitan ser limpiados
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const playAttemptIntervalRef = useRef(null);
  const detectedCodesRef = useRef(new Set());

  // Función para limpiar completamente los recursos de la cámara
  const cleanUpCamera = () => {
    console.log('Limpiando recursos de cámara...');
    
    // 1. Detener el animation frame si existe
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // 2. Limpiar el intervalo de intento de reproducción
    if (playAttemptIntervalRef.current) {
      clearInterval(playAttemptIntervalRef.current);
      playAttemptIntervalRef.current = null;
    }
    
    // 3. Detener todos los tracks del stream de la cámara
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        console.log('Deteniendo track:', track.kind);
        track.stop(); // Esto apaga físicamente la cámara
      });
      streamRef.current = null;
    }
    
    // 4. Liberar la referencia del video
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // 5. Actualizar estado
    setIsScanning(false);
  };

  // Efecto para detectar dispositivos de cámara disponibles
  useEffect(() => {
    const getVideoDevices = async () => {
      try {
        // Primero solicitamos permiso para enumerar dispositivos
        await navigator.mediaDevices.getUserMedia({ video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(d => d.kind === 'videoinput');
        setVideoDevices(videoInputs);
        if (videoInputs.length > 0) {
          setSelectedDeviceId(videoInputs[0].deviceId);
        }
      } catch (err) {
        setErrorMsg('Error al acceder a la cámara: ' + err.message);
      }
    };
    
    getVideoDevices();
    
    return () => {
      // Limpieza al desmontar el componente
      cleanUpCamera();
    };
  }, []);

  // Efecto para ajustar el tamaño del contenedor
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.floor(width * 0.75); // Relación de aspecto 4:3
        setContainerSize({ width, height });
      }
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    
    return () => {
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  // Efecto principal para manejar el escaneo
  useEffect(() => {
    // Si no está activo, limpiamos y salimos
    if (!activo) {
      cleanUpCamera();
      return;
    }

    // Si no tenemos los elementos necesarios, salimos
    if (!selectedDeviceId || !videoRef.current || !canvasRef.current) return;

    const startScanning = async () => {
      try {
        // Limpiar cualquier instancia previa
        cleanUpCamera();
        
        // Actualizar estado
        setIsScanning(true);
        setErrorMsg('');

        // Configuración de la cámara
        const constraints = {
          video: {
            deviceId: selectedDeviceId,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };

        // Obtener stream de la cámara
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', true);

        // Ajustar tamaños
        videoRef.current.style.width = `${containerSize.width}px`;
        videoRef.current.style.height = `${containerSize.height}px`;
        canvasRef.current.width = containerSize.width;
        canvasRef.current.height = containerSize.height;

        // Función para procesar cada frame
        const processFrame = () => {
          if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
            const ctx = canvasRef.current.getContext('2d');
            
            // Calcular dimensiones para mantener relación de aspecto
            const videoAspect = videoRef.current.videoWidth / videoRef.current.videoHeight;
            const canvasAspect = canvasRef.current.width / canvasRef.current.height;

            let renderWidth, renderHeight, offsetX, offsetY;

            if (videoAspect > canvasAspect) {
              renderHeight = canvasRef.current.height;
              renderWidth = videoRef.current.videoWidth * (renderHeight / videoRef.current.videoHeight);
              offsetX = (canvasRef.current.width - renderWidth) / 2;
              offsetY = 0;
            } else {
              renderWidth = canvasRef.current.width;
              renderHeight = videoRef.current.videoHeight * (renderWidth / videoRef.current.videoWidth);
              offsetX = 0;
              offsetY = (canvasRef.current.height - renderHeight) / 2;
            }

            // Dibujar imagen del video en el canvas
            ctx.drawImage(videoRef.current, offsetX, offsetY, renderWidth, renderHeight);

            // Procesar imagen para detectar QR
            const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code && code.data.trim().length > 0) {
              const qrData = code.data.trim();
              // Regex: 2 letras mayúsculas + '-' + 3 dígitos
              const formatoValido = /^[A-Z]{2}-\d{3}$/.test(qrData);
              if (formatoValido && !detectedCodesRef.current.has(qrData)) {
                detectedCodesRef.current.add(qrData);
                onNewCode(qrData);
              }
            }

          }
          
          // Solicitar siguiente frame
          animationFrameRef.current = requestAnimationFrame(processFrame);
        };

        // Función para intentar iniciar la reproducción del video
        const attemptPlay = () => {
          videoRef.current.play()
            .then(() => {
              // Cuando el video comienza a reproducirse, limpiamos el intervalo
              // y comenzamos el procesamiento de frames
              clearInterval(playAttemptIntervalRef.current);
              playAttemptIntervalRef.current = null;
              processFrame();
            })
            .catch(err => {
              console.log('Intento de reproducción fallido:', err);
            });
        };

        // Intentar reproducir el video cada 300ms hasta que funcione
        playAttemptIntervalRef.current = setInterval(attemptPlay, 300);

      } catch (error) {
        console.error('Error en el escaneo:', error);
        setErrorMsg('Error al acceder a la cámara: ' + error.message);
        cleanUpCamera();
      }
    };

    startScanning();

    // Limpieza cuando cambian las dependencias o se desmonta el componente
    return () => {
      cleanUpCamera();
    };
  }, [selectedDeviceId, containerSize, activo, onNewCode]);

  // Función para cambiar entre cámaras disponibles
  const cambiarCamara = () => {
    if (videoDevices.length < 2) return;
    
    const currentIndex = videoDevices.findIndex(d => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setSelectedDeviceId(videoDevices[nextIndex].deviceId);
    detectedCodesRef.current.clear();
  };

  return (
    <div className="relative" ref={containerRef}>
      {errorMsg && (
        <div className="text-red-600 bg-red-100 p-2.5 rounded mb-2.5">
          {errorMsg}
        </div>
      )}
      
      <div
        className="relative bg-black overflow-hidden"
        style={{ width: `${containerSize.width}px`, height: `${containerSize.height}px` }}
      >
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover scale-x-[-1]"
          muted
          playsInline
        />
        
        {!isScanning && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white">
            {activo ? 'Inicializando cámara...' : 'Cámara apagada'}
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {videoDevices.length > 1 && (
        <button
          onClick={cambiarCamara}
          className="mt-2.5 px-4 py-2 bg-green-600 text-white border-none rounded cursor-pointer disabled:opacity-50"
          disabled={!isScanning}
        >
          Cambiar cámara
        </button>
      )}
    </div>
  );
};

const QRScannerApp = ({ onCodesDetected, activo = true }) => {
  const [codigosEscaneados, setCodigosEscaneados] = useState([]);
  const [lastScanned, setLastScanned] = useState(null);
  const [scanStatus, setScanStatus] = useState(activo ? 'Escaneando...' : 'Escaneo desactivado');

  // Efecto para actualizar el estado cuando cambia la prop 'activo'
  useEffect(() => {
    setScanStatus(activo ? 'Escaneando...' : 'Escaneo desactivado');
    
    // Si se desactiva, limpiamos los códigos escaneados
    if (!activo) {
      setCodigosEscaneados([]);
      setLastScanned(null);
    }
  }, [activo]);

  // Función para manejar nuevos códigos detectados
  const handleNewCode = (nuevoCodigo) => {
    // Si el escáner no está activo, ignoramos nuevos códigos
    if (!activo) return;
    
    setCodigosEscaneados(prev => {
      // Si el código ya fue escaneado, no hacemos nada
      if (prev.some(code => code.data === nuevoCodigo)) return prev;

      // Crear nuevo objeto de código escaneado
      const newCode = {
        data: nuevoCodigo,
        timestamp: new Date().toLocaleTimeString()
      };

      // Actualizar estado con el nuevo código
      setLastScanned(newCode);
      setScanStatus('QR válido detectado');
      
      // Volver al estado normal después de 2 segundos
      setTimeout(() => setScanStatus('Escaneando...'), 2000);
      
      // Crear nueva lista con el código añadido
      const updatedList = [...prev, newCode];
      
      // Notificar al componente padre si es necesario
      if (onCodesDetected) {
        onCodesDetected(updatedList.map(c => c.data));
      }
      
      return updatedList;
    });
  };

  return (
    <div className="max-w-[600px] mx-5 my-5 font-sans p-5 shadow-md rounded-lg md:mx-auto">
      <div className="p-4 mb-5 text-center">
        <div className={`mb-2.5 font-bold ${
          scanStatus === 'QR válido detectado' ? 'text-green-600' : 
          scanStatus === 'Escaneando...' ? 'text-gray-800' : 'text-gray-500'
        }`}>
          {scanStatus}
        </div>
        
        <div className="flex justify-center">
          <MultiQRScanner 
            onNewCode={handleNewCode} 
            maxCodes={10} 
            activo={activo} 
          />
        </div>
      </div>

      {lastScanned && (
        <div className="bg-green-100 p-2.5 rounded mb-4 text-center">
          <strong>Último código escaneado:</strong> {lastScanned.data}
          <div className="text-sm text-gray-600">{lastScanned.timestamp}</div>
        </div>
      )}

      <h3 className="text-gray-800 border-b border-gray-200 pb-1.5">
        Códigos detectados ({codigosEscaneados.length})
      </h3>

      {codigosEscaneados.length === 0 ? (
        <p className="text-gray-500 text-center">No se ha detectado ningún código QR válido.</p>
      ) : (
        <ul className="list-none p-0 max-h-[300px] overflow-y-auto border border-gray-200 rounded">
          {codigosEscaneados.map((code, i) => (
            <li
              key={i}
              className={`p-2.5 border-b border-gray-200 flex justify-between ${
                i % 2 === 0 ? 'bg-white' : 'bg-gray-50'
              }`}
            >
              <span className="text-green-800 font-bold">{code.data}</span>
              <span className="text-sm text-gray-600">{code.timestamp}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QRScannerApp;