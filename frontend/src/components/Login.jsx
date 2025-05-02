import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { app } from "../components/firebase_config";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const MAX_ATTEMPTS = 3;
const LOCK_TIME_MS = 5 * 60 * 1000; // 5 minutos

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAttempts = parseInt(localStorage.getItem("login_attempts")) || 0;
    const storedLockedUntil = parseInt(localStorage.getItem("locked_until")) || null;

    setAttempts(storedAttempts);
    if (storedLockedUntil && Date.now() < storedLockedUntil) {
      setLockedUntil(storedLockedUntil);
    } else {
      localStorage.removeItem("locked_until");
      localStorage.setItem("login_attempts", "0");
    }
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const interval = setInterval(() => {
      const remaining = lockedUntil - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        setLockedUntil(null);
        setAttempts(0);
        localStorage.removeItem("locked_until");
        localStorage.setItem("login_attempts", "0");
      } else {
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        setRemainingTime(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockedUntil && Date.now() < lockedUntil) {
      setError("Demasiados intentos. Intenta nuevamente en unos minutos.");
      return;
    }

    setLoading(true);
    setError("");

    const auth = getAuth(app);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verificar si el correo está verificado
      if (!user.emailVerified) {
        await signOut(auth); // Cerrar sesión si no está verificado
        setError("Debes verificar tu correo antes de iniciar sesión.");
        return;
      }

      const token = await user.getIdToken();

      await axios.post("http://127.0.0.1:8000/login/", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      localStorage.setItem("token", token);
      localStorage.setItem("login_attempts", "0");
      navigate("/panel");
    } catch (error) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      localStorage.setItem("login_attempts", newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const lockTime = Date.now() + LOCK_TIME_MS;
        setLockedUntil(lockTime);
        localStorage.setItem("locked_until", lockTime.toString());
        setError("Demasiados intentos fallidos. Intenta de nuevo en 5 minutos.");
      } else {
        setError("Credenciales incorrectas. Intento " + newAttempts + " de " + MAX_ATTEMPTS);
      }
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
            disabled={lockedUntil && Date.now() < lockedUntil}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg pr-12"
              required
              disabled={lockedUntil && Date.now() < lockedUntil}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-600 cursor-pointer text-xl"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          {lockedUntil && Date.now() < lockedUntil && (
            <p className="text-yellow-600 text-sm">
              Espera {remainingTime} segundos para volver a intentarlo.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
            disabled={loading || (lockedUntil && Date.now() < lockedUntil)}
          >
            {loading ? "Cargando..." : "Ingresar"}
          </button>

          <div className="flex justify-between mt-4 text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:underline">Olvidé mi contraseña</Link>
            <Link to="/registro" className="text-blue-600 hover:underline">Registrarse</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
