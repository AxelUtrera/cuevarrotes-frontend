import React from 'react';
import { Form } from 'react-bootstrap';
import "./styles/LoginForm.css";

const InputField = ({ label, type, value, onChange }) => (
  <Form.Group>
    <Form.Label>{label}</Form.Label>
    <Form.Control type={type} value={value} onChange={onChange} />
  </Form.Group>
);

export default InputField;
