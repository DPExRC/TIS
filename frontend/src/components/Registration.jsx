import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate
import axios from "axios";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate(); // Hook para la redirección

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("http://127.0.0.1:8000/register/", {
        email,
        password,
        display_name: displayName,
      });

      // Si el registro es exitoso, redirige al login
      navigate("/");
    } catch (error) {
      console.error("Error de registro:", error.response);
      
      if (error.response) {
        const firebaseError = error.response.data.error || "Hubo un error al registrarte.";
  
        // Traducción de errores comunes de Firebase
        let translatedError = firebaseError;
        if (firebaseError.includes("Invalid password string. Password must be a string at least 6 characters long.")) {
          translatedError = "La contraseña debe tener al menos 6 caracteres.";
        } else if (firebaseError.includes("The email address is already in use")) {
          translatedError = "El correo electrónico ya está registrado.";
        } else if (firebaseError.includes("Invalid email")) {
          translatedError = "El correo electrónico no es válido.";
        }
  
        setError(translatedError);
      } else {
        setError("Hubo un error al conectarse al servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-w-screen">
      <div className="p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-4xl font-bold text-center mb-6">Registro</h2>

        <form onSubmit={handleRegister} className="space-y-4">
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

          <input
            type="text"
            placeholder="Nombre de usuario"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
