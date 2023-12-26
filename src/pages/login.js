import React, { useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import InputField from '../components/InputField';
import LoginButton from '../components/LoginButton';
import BackButton from '../components/BackButton';
import '../components/styles/LoginContainer.css';
import '../components/styles/LoginForm.css';
import '../components/styles/Login.css';
import login from '../Logic/authService'; 
import { encriptPassword } from '../Logic/utilities';

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validatePhone = (phone) => {
    const phoneRegex = /^\d{10}$/;
    return phoneRegex.test(phone);
  };

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
      }

      // Maneja la respuesta exitosa, como redirigir, etc.

    } catch (error) {
      setError(true);
      setErrorMessage("Conexion no disponible, intente mas tarde");
    }
  };

  return (
    <Container className="login-container">
      <BackButton href="/donde-sea" />
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
  );
}
