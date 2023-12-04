import React, { useState } from 'react';
import { Container, Form } from 'react-bootstrap';
import InputField from '../components/InputField'; 
import LoginButton from '../components/LoginButton'; 
import BackButton from '../components/BackButton';
import '../components/styles/LoginContainer.css'; 
import '../components/styles/LoginForm.css';
import "../components/styles/Login.css";

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Lógica de inicio de sesión
    console.log(phoneNumber, password);
  };

  return (
    <Container className="login-container">
      <BackButton href="/donde-sea" />
      <Form className="login-form">
        <h2 className="text-center">BIENVENID@ :)</h2>
        <InputField 
          label="Ingrese su número telefónico:"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
        />
        <InputField 
          label="Ingrese su contraseña:"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <LoginButton onClick={handleLogin} />
      </Form>
    </Container>
  );
}

