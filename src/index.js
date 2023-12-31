import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/login';
import {AddAddressCustomer} from './pages/addAddressCustomer'
import App from'./pages/createBranch'
import  {EditProfileCustomer} from './pages/editProfileCustomer'
import { OrderGestion } from './pages/orderGestion';
import {ViewOrderDeliveryMan} from './pages/ordersDeliveryMan'
import OrderDetails from './pages/ordersDetails';
import { RegisterCustomer } from './pages/registerCustomer';
import { RegisterProduct } from './pages/registerProductAdministrator';
import { OrderHistory } from './pages/viewOrdersCustomer';
import ViewProducts from './pages/viewProducts'
import { AdministratorMenu } from './pages/administratorMenu';
import CheckoutPage from './pages/checkout';
import PaymentMethodForm from './pages/registerPaymentMethod';
import EmployeeRegistrationForm from './pages/registerEmployee';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        {/*Customer routes */}
        <Route path="/homePage/:phoneNumber" element={<ViewProducts />} />
        <Route path="/editProfile/:phoneNumber" element={<EditProfileCustomer />} />
        <Route path="/addAddress/:phoneNumber" element={<AddAddressCustomer />} />
        <Route path="/register" element={<RegisterCustomer />} />
        <Route path="/orderHistory/:customerPhoneNumber" element={<OrderHistory />} />
        <Route path="/paymentMethod/:phoneNumber" element={<PaymentMethodForm />} />
        <Route path="/checkout/:phoneNumber" element={<CheckoutPage />} />
        {/*Employee routes */}
        <Route path="/administratorMenu" element={<AdministratorMenu />} />
        <Route path="/orderDetails/:orderNumber/:employeeNumber" element={<OrderDetails />} />
        <Route path="/orderGestion" element={<OrderGestion />} />
        <Route path="/asignedOrders/:employeeNumber" element={<ViewOrderDeliveryMan />} />
        <Route path="/registerEmployee" element={<EmployeeRegistrationForm />} />
        {/*Administrator routes */}
        <Route path="/registerProduct" element={<RegisterProduct />} />
        <Route path="/createBranch" element={<App />} />
        <Route path="/orderDetails/:orderNumber" element={<OrderDetails />} />
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
