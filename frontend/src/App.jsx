import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/DashBoard';
import Cattle from './pages/Cattle';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Actual from './pages/Actual';  
import Alerts from './pages/Alerts'; 
import CoutingPresence from './pages/CountingPresence';
import RegisterAnimals from './pages/RegisterAnimals';
import TotalAnimals from './pages/TotalAnimals';
import Settings from './pages/settings';
import ConteoPresenciaPage from './pages/Totalspecifico';
import Horarios from './pages/Horarios';
import BarcodeScanner from './pages/Barcodescanner';
import Zones from './pages/Zones';
import AsignateHorarios from './pages/AsignateHorarios';
import TotalHorarios from './pages/TotalHorarios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [auth]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 font-semibold">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }


  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={!user ? <Login /> : <Navigate to="/panel" />} />
        <Route path="/registro" element={!user ? <Register /> : <Navigate to="/panel" />} />

        {/* Rutas protegidas */}
        <Route path="/perfil" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
        <Route path="/panel" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/ganado" element={user ? <Cattle user={user} /> : <Navigate to="/" />} />
        <Route path="/reportes" element={user ? <Reports user={user} /> : <Navigate to="/" />} />
        <Route path="/actual" element={user ? <Actual user={user} /> : <Navigate to="/" />} />
        <Route path="/alertas" element={user ? <Alerts user={user} /> : <Navigate to="/" />} />
        <Route path="/conteoypresencia" element={user ? <CoutingPresence user={user} /> : <Navigate to="/" />} />
        <Route path="/registroanimales" element={user ? <RegisterAnimals user={user} /> : <Navigate to="/" />} />
        <Route path="/totalanimales" element={user ? <TotalAnimals user={user} /> : <Navigate to="/" />} />
        <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/" />} />
        <Route path="/totalespecifico" element={user ? <ConteoPresenciaPage user={user} /> : <Navigate to="/" />} />
        <Route path="/horarios" element={user ? <Horarios user={user} /> : <Navigate to="/" />} />
        <Route path="/scanner" element={user ? <BarcodeScanner user={user} /> : <Navigate to="/" />} />
        <Route path="/zonas" element={user ? <Zones user={user} /> : <Navigate to="/" />} />
        <Route path="/asignarhorarios" element={user ? <AsignateHorarios user={user} /> : <Navigate to="/" />} />
        <Route path="/totalhorarios" element={user ? <TotalHorarios user={user} /> : <Navigate to="/" />} />



      </Routes>
    </Router>
  );
}

export default App;
