import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import MapComponent from './pages/viewProducts';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MapComponent />} />
        {/* Puedes agregar más rutas aquí */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
