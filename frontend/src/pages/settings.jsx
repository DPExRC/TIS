// src/pages/Settings.jsx
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/NavBar";

const Settings = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center py-12 px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-xl w-full space-y-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-center text-gray-800 tracking-tight">
            Configuración
          </h1>

          <section className="space-y-2 border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-700">👤 Sesión activa</h2>
            {user ? (
              <>
                <p className="text-gray-800"><span className="font-medium">Nombre:</span> {user.displayName || "No definido"}</p>
                <p className="text-gray-800"><span className="font-medium">Correo:</span> {user.email}</p>
              </>
            ) : (
              <p className="text-gray-500">Cargando usuario...</p>
            )}
          </section>

          <section className="space-y-4 border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-700">⚙️ Opciones futuras</h2>
            <p className="text-gray-600">Aquí podrás ajustar notificaciones, idioma, interfaz, y más.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
