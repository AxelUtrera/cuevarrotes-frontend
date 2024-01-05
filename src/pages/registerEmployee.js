import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import "../components/styles/employeeRegistration.css";
import { useNavigate } from 'react-router-dom';

function EmployeeRegistrationForm() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        numero: '',
        nss: '',
        contrasena: '',
        confirmarContrasena: '',
        rol: 'Ejecutivo de ventas',
    });
    const [error, setError] = useState('');

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };


    const navigateToMenu = () => {
        navigate('/administratorMenu')
    }

    const validateFields = () => {
        const { nombre, apellido, numero, nss, contrasena, confirmarContrasena } = formData;
        if (!nombre || !apellido || !numero || !nss || !contrasena || !confirmarContrasena) {
            setError('Todos los campos son obligatorios.');
            return false;
        }

        if (numero.length !== 10 || !/^\d+$/.test(numero)) {
            setError('El número de teléfono debe ser de 10 dígitos.');
            return false;
        }

        if (nss.length !== 11 || !/^\d+$/.test(nss)) {
            setError('El NSS debe ser de 11 dígitos.');
            return false;
        }

        if (contrasena !== confirmarContrasena) {
            setError('Las contraseñas no coinciden.');
            return false;
        }

        setError('');
        return true;
    };

    const encriptPassword = async (password) => {

        const encoder = new TextEncoder();
        const data = encoder.encode(password);

        const hashBuffer = await crypto.subtle.digest('SHA-256', data);

        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');

        return hashHex;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (validateFields()) {
            try {

                const dataToSend = {
                    nombre: formData.nombre,
                    apellido: formData.apellido,
                    numero: formData.numero,
                    nss: formData.nss,
                    contrasena: formData.contrasena, 
                    rol: formData.rol
                };

                dataToSend.contrasena = await encriptPassword(dataToSend.contrasena);

                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/employee/addEmployee`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(dataToSend),
                });

                const responseData = await response.json();

                if (response.ok) {
                    alert('Registro completado con éxito.');
                } else {
                    alert(`Error en el registro: ${responseData.message}`);
                }
            } catch (error) {
                alert(`Error en la solicitud: ${error.message}`);
            }
        }
    };


    return (
        <div className="employee-registration-form-container">
            <Card className="employee-registration-card">
                <Card.Body>
                    <a onClick={navigateToMenu} className="return-link">← Regresar</a>
                    <h2 className="form-title">Nuevo Empleado</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <Form.Group className="mb-3">
                            <Form.Label>¿Cuál es su nombre?</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                placeholder="Nombre"
                            />
                        </Form.Group>

                        {/* Apellido */}
                        <Form.Group className="mb-3">
                            <Form.Label>¿Cuál es su apellido?</Form.Label>
                            <Form.Control
                                type="text"
                                name="apellido"
                                value={formData.apellido}
                                onChange={handleInputChange}
                                placeholder="Apellido"
                            />
                        </Form.Group>

                        {/* Número */}
                        <Form.Group className="mb-3">
                            <Form.Label>¿Cuál es su número?</Form.Label>
                            <Form.Control
                                type="tel"
                                name="numero"
                                value={formData.numero}
                                onChange={handleInputChange}
                                placeholder="Número de teléfono"
                            />
                        </Form.Group>

                        {/* NSS */}
                        <Form.Group className="mb-3">
                            <Form.Label>¿Cuál es su NSS?</Form.Label>
                            <Form.Control
                                type="text"
                                name="nss"
                                value={formData.nss}
                                onChange={handleInputChange}
                                placeholder="NSS"
                            />
                        </Form.Group>

                        {/* Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label>¿Cuál es tu contraseña?</Form.Label>
                            <Form.Control
                                type="password"
                                name="contrasena"
                                value={formData.contrasena}
                                onChange={handleInputChange}
                                placeholder="Contraseña"
                            />
                        </Form.Group>

                        {/* Confirmar Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label>Repite tu contraseña</Form.Label>
                            <Form.Control
                                type="password"
                                name="confirmarContrasena"
                                value={formData.confirmarContrasena}
                                onChange={handleInputChange}
                                placeholder="Confirmar Contraseña"
                            />
                        </Form.Group>

                        {/* Rol */}
                        <Form.Group className="mb-3">
                            <Form.Label>¿Cuál es su rol?</Form.Label>
                            <Form.Select
                                name="rol"
                                value={formData.rol}
                                onChange={handleInputChange}
                            >
                                <option value="Ejecutivo de ventas">Ejecutivo de ventas</option>
                                <option value="Repartidor">Repartidor</option>
                                <option value="Administrador">Administrador</option>

                            </Form.Select>
                        </Form.Group>

                        {/* Botón de registro */}
                        <Button variant="primary" type="submit">
                            Registrarse
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default EmployeeRegistrationForm;
