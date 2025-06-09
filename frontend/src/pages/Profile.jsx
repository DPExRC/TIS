import { useState, useEffect } from "react";
import {
  getAuth,
  onAuthStateChanged,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import Navbar from "../components/NavBar";
import "../styles/Profile.css"; // Asegúrate de mantener esta

const Profile = () => {
  const [user, setUser] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUser(user);
    });
    return () => unsubscribe();
  }, [auth]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    if (newPassword.length < 8 || !/\d/.test(newPassword)) {
      setError("La nueva contraseña debe tener al menos 8 caracteres y un número.");
      return;
    }

    try {
      setLoading(true);
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      setMessage("Contraseña actualizada correctamente.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Error al cambiar contraseña: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen ">
      <Navbar />
      <div className="flex justify-center items-center py-12 px-4">
        <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-xl w-full space-y-8 border border-gray-200">
          <h1 className="text-4xl font-bold text-center text-gray-800 tracking-tight">
            Perfil del Usuario
          </h1>

          <section className="space-y-2 border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-700">👤 Información personal</h2>
            {user ? (
              <>
                <p className="text-gray-800"><span className="font-medium">Nombre:</span> {user.displayName || "No definido"}</p>
                <p className="text-gray-800"><span className="font-medium">Correo:</span> {user.email}</p>
              </>
            ) : (
              <p className="text-gray-500">Cargando información del usuario...</p>
            )}
          </section>

          <section className="space-y-4 border-t pt-6">
            <h2 className="text-2xl font-semibold text-gray-700">🔒 Cambiar contraseña</h2>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <input
                type="password"
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="password"
              />
              <input
                type="password"
                placeholder="Nueva contraseña"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="password"
              />
              <input
                type="password"
                placeholder="Confirmar nueva contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="password"
              />

              {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
              {message && <p className="text-green-600 text-sm font-medium">{message}</p>}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white font-semibold transition duration-200 ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Procesando..." : "Cambiar contraseña"}
              </button>
            </form>
          </section>


        </div>
      </div>
    </div>
  );
};

export default Profile;
