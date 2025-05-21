import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { app } from "../components/firebase_config";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const auth = getAuth(app);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Crear el usuario
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Actualizar el perfil con displayName
      await updateProfile(user, {
        displayName: displayName,
      });

      // 3. Enviar email de verificación
      await sendEmailVerification(user);

      // 4. Cerrar sesión
      await signOut(auth);

      // 5. Aviso al usuario
      alert("Registro exitoso. Revisa tu correo y confirma antes de iniciar sesión.");
      navigate("/");

    } catch (error) {
      console.error("Error de registro:", error);
      let firebaseError = error.message;

      if (firebaseError.includes("auth/email-already-in-use")) {
        firebaseError = "El correo electrónico ya está registrado.";
      } else if (firebaseError.includes("auth/invalid-email")) {
        firebaseError = "El correo electrónico no es válido.";
      } else if (firebaseError.includes("auth/weak-password")) {
        firebaseError = "La contraseña debe tener al menos 6 caracteres.";
      }

      setError(firebaseError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-screen">
      <div className="p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-4xl font-bold text-center mb-6">Registro</h2>

        <form onSubmit={handleRegister} className="space-y-4">
          <input type="email" placeholder="Correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="password" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-2 border rounded-lg" required />
          <input type="text" placeholder="Nombre de usuario" value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="w-full px-4 py-2 border rounded-lg" />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg" disabled={loading}>
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
