import React, { useState } from 'react';
import { Container, Form, NavbarOffcanvas } from 'react-bootstrap';
import InputField from '../components/InputField';
import LoginButton from '../components/LoginButton';
import BackButton from '../components/BackButton';
import '../components/styles/LoginContainer.css';
import '../components/styles/LoginForm.css';
import '../components/styles/Login.css';
import login from '../Logic/authService';
import { encriptPassword } from '../Logic/utilities';
import { useNavigate } from 'react-router-dom';
import { getPhoneNumber } from '../Logic/customerPetitions';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

  const navitageToRegister = () => {
    navigate('/register')
  }

  const handleLogin = async (e) => {
    e.preventDefault();

    setError(false);
    setErrorMessage('');

    if (!phoneNumber || !password) {
      setError(true);
      setErrorMessage('Rellene los datos faltantes');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError(true);
      setErrorMessage('Número de teléfono inválido, verifíquelo');
      return;
    }

    try {
      let encryptedPassword = await encriptPassword(password);

      const data = await login(phoneNumber, encryptedPassword);

      if (data.token) {
        localStorage.setItem('token', data.token);
        const token = localStorage.getItem('token');

        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/role`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const roleData = await response.json();

          if (!response.ok) {
            throw new Error(roleData.message || 'No se pudo obtener el rol del usuario.');
          }

          const userRole = roleData.role;

          if (userRole === 'customer') {
            navigate(`/homePage/${phoneNumber}`)
          } else if (userRole === 'Administrador') {
            navigate('/administratorMenu');
          } else if (userRole === 'Repartidor') {
            navigate(`/asignedOrders/${phoneNumber}`);
          } else if (userRole === 'Ejecutivo de ventas') {
            navigate('/orderGestion');
          } else {
            console.error('El rol del usuario no es reconocido:', userRole);
          }
        } catch (error) {
          console.error('Hubo un error al obtener el rol del usuario:', error);
          localStorage.removeItem('token');
          navigate('/login');
        }
      }

    } catch (error) {
      setError(true);
      setErrorMessage("Conexion no disponible, intente mas tarde");
    }
  };

  return (
    <div className="login-screen-container">
      <Container className="login-container">
        <div className="back-button" style={{cursor: 'pointer'}}>
          <a onClick={navitageToRegister}>← Registrate!</a>
        </div>
        <Form className="login-form" onSubmit={handleLogin}>
          <h2 className="text-center">BIENVENID@ :)</h2>
          <InputField
            label="Ingrese su número telefónico:"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            isError={error && (!phoneNumber || !validatePhone(phoneNumber))}
          />
          <InputField
            label="Ingrese su contraseña:"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            isError={error && !password}
          />
          <LoginButton />
          {error && <div className="error-message">{errorMessage}</div>}
        </Form>
      </Container>
    </div>
  );
}
