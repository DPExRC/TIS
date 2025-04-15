import React, { useState } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

// Importa la configuración de Firebase
import app from "./firebase_config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();  // Hook para redirección

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const auth = getAuth(app); // Pasa la app de Firebase aquí
    try {
      // Autenticar con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener el token de Firebase
      const token = await user.getIdToken();

      // Enviar el token al backend para verificación
      const response = await axios.post("http://127.0.0.1:8000/login/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Autenticado:", response.data);
      localStorage.setItem("token", token); // Guardar token en localStorage

      // Redirigir al Dashboard después de la autenticación exitosa
      navigate("/dashboard");
    } catch (error) {
      console.log("Error de autenticación:", error);
      setError("Credenciales incorrectas o usuario no registrado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-screen">
      <div className="p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-4xl font-bold text-center mb-6">Iniciar Sesión</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Ingresar"}
          </button>

          <div className="flex justify-between mt-4 text-sm">
            {/* Usa Link para navegar entre páginas de la SPA */}
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Olvidé mi contraseña</Link>
            <Link to="/register" className="text-blue-600 hover:underline">Registrarse</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
