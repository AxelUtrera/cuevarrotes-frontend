import React from 'react';
import { Button } from 'react-bootstrap';

const LoginButton = ({ onClick }) => (
  <Button variant="primary" type="submit" onClick={onClick}>
    Iniciar sesión
  </Button>
);

export default LoginButton;
