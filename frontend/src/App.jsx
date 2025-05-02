import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './pages/DashBoard';
import Cattle from './pages/Cattle';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Alerts from './pages/Alerts';
import CoutingPresence from './pages/CountingPresence';
import RegisterAnimals from './pages/RegisterAnimals';7
import TotalAnimals from './pages/TotalAnimals'; // Asegúrate de que esta ruta sea correcta

//import PrivateRoute from './components/PrivateRoute'; // Importamos el PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="/panel" element={<Dashboard />} />
        <Route path="/ganado" element={<Cattle />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/alertas" element={<Alerts />} />
        <Route path="/conteoypresencia" element={<CoutingPresence />} />
        <Route path="/registroanimales" element={<RegisterAnimals />} />
        <Route path="/totalanimales" element={< TotalAnimals/>} />


        {/* Ruta protegida por PrivateRoute 
        <PrivateRoute path="/dashboard" element={<Dashboard />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;
