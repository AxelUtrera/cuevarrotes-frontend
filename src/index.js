import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {OrderHistory}  from './pages/viewOrdersCustomer';
import Login from './pages/login';
import ViewProducts from './pages/viewProducts';
import {ViewOrderDeliveryMan} from './pages/ordersDeliveryMan'
import OrderDetails from './pages/ordersDetails';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/homePage/:phoneNumber" element={<ViewProducts />} />
        <Route path="/orderDetails/:orderNumber" element={<OrderDetails />} />
        {/* Puedes agregar más rutas aquí */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
