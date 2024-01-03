import React, { useState } from 'react';
import { AcceptButton, ExceptionMessage } from "../components/componentsUI";
import { Container, Form, Row, Col } from "react-bootstrap";
import { encriptPassword } from '../Logic/utilities';
import '../components/componentsUI.css'

const RegisterCustomer = () => {
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        fechaNacimiento: '',
        numTelefono: '',
        contrasenia: '',
        confirmarContrasenia: ''
    });


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value, });
    };


    const sendCustomerData = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (
            formData.nombre.trim() === '' ||
            formData.apellidos.trim() === '' ||
            formData.fechaNacimiento.trim() === '' ||
            formData.numTelefono.trim() === '' ||
            formData.contrasenia.trim() === '' ||
            formData.confirmarContrasenia.trim() === ''
        ) {
            setValidated(true);
            return;
        }

        if (form.checkValidity()) {
            try {
                const checkResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/customerNotRegistered/${formData.numTelefono}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (checkResponse.status === 200) {
                    const { confirmarContrasenia, ...formDataWithoutConfirmation } = formData;

                    const hashedPassword = await encriptPassword(formDataWithoutConfirmation.contrasenia);

                    const registerResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/registerCustomer`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            ...formDataWithoutConfirmation,
                            contrasenia: hashedPassword,
                        }),
                    });

                    if (registerResponse.ok) {
                        setRegistrationStatus('success');
                    } else {
                        setRegistrationStatus('error');
                    }

                } else if (checkResponse.status === 201) {
                    setRegistrationStatus('already-registered');
                }
            } catch (error) {
                console.error('Error en la solicitud:', error);
                setRegistrationStatus('error');
            }
        }
    };


    const isPhoneNumberValid = (phoneNumber) => {
        const phoneNumberRegex = /^\d{10}$/;
        return phoneNumberRegex.test(phoneNumber);
    };


    const arePasswordsMatching = () => {
        return formData.contrasenia === formData.confirmarContrasenia;
    };


    return (
        <Container className="center-container">
            <h3 className="title">¿Quién eres?</h3>

            <Form noValidate validated={validated} onSubmit={sendCustomerData}>

                <Row className="mb-3">
                    <Form.Group controlId="formFirstName" as={Col} md="6">
                        <Form.Label className="text">¿Cuál es tu nombre?</Form.Label>
                        <Form.Control required type="text" name='nombre' value={formData.nombre} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group controlId="formLastName" as={Col} md="6">
                        <Form.Label className="text">¿Cuál es tu apellido?</Form.Label>
                        <Form.Control required type="text" name='apellidos' value={formData.apellidos} onChange={handleChange} />
                    </Form.Group>
                </Row>

                <Form.Group controlId="formPhoneNumber">
                    <Form.Label className="text">¿Cuál es tu número de teléfono?</Form.Label>
                    <Form.Control required type="tel" name='numTelefono' value={formData.numTelefono} onChange={handleChange} isInvalid={!isPhoneNumberValid(formData.numTelefono)} />
                    <Form.Control.Feedback type="invalid">
                        Por favor, ingrese un número de teléfono válido de 10 dígitos.
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="formBirthDate">
                    <Form.Label className="text">¿Cuándo naciste?</Form.Label>
                    <Form.Control required type="date" name='fechaNacimiento' value={formData.fechaNacimiento} onChange={handleChange} />
                </Form.Group>

                <Form.Group controlId="formPassword">
                    <Form.Label className="text">¿Cuál es tu contraseña?</Form.Label>
                    <Form.Control required type="password" name='contrasenia' value={formData.contrasenia} onChange={handleChange} />
                </Form.Group>

                <Form.Group controlId="formConfirmPassword">
                    <Form.Label className="text">Confirma tu contraseña</Form.Label>
                    <Form.Control required type="password" name='confirmarContrasenia' value={formData.confirmarContrasenia} onChange={handleChange} isInvalid={!arePasswordsMatching()} />
                    <Form.Control.Feedback type="invalid">
                        Las contraseñas no coinciden.
                    </Form.Control.Feedback>
                </Form.Group>

                <AcceptButton buttonText='Registrarse' onClickMethod={sendCustomerData} />

                {registrationStatus === 'success' && (
                    <div className="text-success">Registro exitoso. ¡Bienvenido!</div>
                )}

                {registrationStatus === 'error' && (
                    <ExceptionMessage message="Error en el registro. Por favor, inténtalo de nuevo." />
                )}

                {registrationStatus === 'already-registered' && (
                    <ExceptionMessage message="El usuario ya está registrado." />
                )}
            </Form>
        </Container>
    );
}

export { RegisterCustomer }
