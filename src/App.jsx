// App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from './Components/Login/Login';
import Home from './Components/Home/Home';
import { ROUTES } from "./routes";


function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  
  const handleLogin = (token, expiresAt) => {
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("expiresAt", expiresAt);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem("token");
    localStorage.removeItem("expiresAt");
  };

  return (
      <Routes>
        <Route 
          path="/" 
          element={token ? <Navigate to={ROUTES.HOME} /> : <Navigate to={ROUTES.LOGIN} />} 
        />
        <Route 
          path={ROUTES.LOGIN} 
          element={!token ? <Login onLogin={handleLogin} /> : <Navigate to={ROUTES.HOME} />} 
        />
        <Route 
          path={ROUTES.HOME} 
          element={token ? <Home onLogout={handleLogout} /> : <Navigate to={ROUTES.LOGIN} />} 
        />
      </Routes>
  );
}

export default App;