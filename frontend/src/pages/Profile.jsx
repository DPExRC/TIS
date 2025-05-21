import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Navbar from "../components/NavBar";

const Profile = () => {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">👤 Información del usuario</h2>
          {user ? (
            <>
              <p className="text-base text-white font-medium">Nombre: {user.displayName || "No definido"}</p>
              <p className="text-base text-white font-medium">Correo: {user.email}</p>
            </>
          ) : (
            <p className="text-base text-white">Cargando información del usuario...</p>
          )}
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">✏️ Editar datos personales</h2>
          <p className="text-sm text-gray-700">Actualiza tu nombre, correo u otra información relevante.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🔒 Cambiar contraseña</h2>
          <p className="text-sm text-gray-700">Gestiona la seguridad de tu cuenta modificando tu contraseña actual.</p>
        </section>
      </div>
    </div>
  );
};

export default Profile;
