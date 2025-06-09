import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { app } from "../components/firebase_config";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logo from "../assets/logo.png";

const MAX_ATTEMPTS = 3;
const LOCK_TIME_MS = 5 * 60 * 1000;

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

      if (!user.emailVerified) {
        await signOut(auth);
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
        setError(`Credenciales incorrectas. Intento ${newAttempts} de ${MAX_ATTEMPTS}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: `linear-gradient(
          to bottom right,
          rgba(59, 130, 246, 0.4),   /* blue-500 at 40% opacity */
          rgba(37, 99, 235, 0.4),    /* blue-600 at 40% opacity */
          rgba(30, 64, 175, 0.4)     /* blue-900 at 40% opacity */
        )`,
      }}
    >
      {/* Logo */}
      <img src={logo} alt="Logo" className="w-28 h-28 mb-6" />

      {/* Caja de login con efecto vidrio esmerilado */}
      <div
        className="w-96 p-8 rounded-xl shadow-2xl border"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.15)", // blanca translúcida
          backdropFilter: "blur(12px)",                 // blur para efecto vidrio esmerilado
          borderColor: "rgba(255, 255, 255, 0.3)",     // borde suave semitransparente
          borderStyle: "solid",
          borderWidth: "1px",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        }}
      >
        <h2 className="text-3xl font-bold text-black text-center mb-6">Iniciar Sesión</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border bg-white/80 text-black"
            required
            disabled={lockedUntil && Date.now() < lockedUntil}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border bg-white/80 text-black pr-12"
              required
              disabled={lockedUntil && Date.now() < lockedUntil}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-xl text-gray-700"
            >
              {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
            </span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {lockedUntil && Date.now() < lockedUntil && (
            <p className="text-yellow-300 text-sm">
              Espera {remainingTime} para volver a intentarlo.
            </p>
          )}

          <button
            id="btnIngresar"
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition duration-200"
            disabled={loading || (lockedUntil && Date.now() < lockedUntil)}
          >
            {loading ? "Cargando..." : "Ingresar"}
          </button>

          <div className="flex justify-between mt-4 text-sm text-white">
            <Link to="/forgot-password" className="hover:underline text-black">Olvidé mi contraseña</Link>
            <Link to="/registro" className="hover:underline text-black">Registrarse</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
