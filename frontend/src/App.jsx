import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Registration';
import Dashboard from './pages/DashBoard';
import Profile from './pages/Profile';
//import PrivateRoute from './components/PrivateRoute'; // Importamos el PrivateRoute

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />


        {/* Ruta protegida por PrivateRoute 
        <PrivateRoute path="/dashboard" element={<Dashboard />} />
        */}
      </Routes>
    </Router>
  );
}

export default App;
