import React from 'react';
import { Route, Navigate } from 'react-router-dom'; // Importar Navigate en lugar de Redirect
import { getAuth } from 'firebase/auth';
import app from './firebase_config'; // Asegúrate de importar tu configuración de Firebase

// Componente PrivateRoute para proteger rutas
const PrivateRoute = ({ element, ...rest }) => {
  const auth = getAuth(app);
  const user = auth.currentUser;  // Verificar si hay un usuario autenticado

  return (
    // Si el usuario está autenticado, renderiza la ruta, de lo contrario redirige
    user ? element : <Navigate to="/" replace /> 
  );
};

export default PrivateRoute;
