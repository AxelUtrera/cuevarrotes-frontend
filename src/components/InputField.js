import React from 'react';
import { Form } from 'react-bootstrap';
import "./styles/LoginForm.css";

const InputField = ({ label, type, value, onChange, isError }) => (
  <Form.Group>
    <Form.Label>{label}</Form.Label>
    <Form.Control 
      type={type} 
      value={value} 
      onChange={onChange} 
      className={isError ? 'input-error' : ''} 
    />
  </Form.Group>
);

export default InputField;
