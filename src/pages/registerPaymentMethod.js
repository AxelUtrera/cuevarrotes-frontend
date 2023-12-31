import React, { useState } from 'react';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import "../components/styles/payment.css";
import { useNavigate, useParams } from 'react-router';

function PaymentMethodForm() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: '',
        issuer: 'Visa',
    });
    const [error, setError] = useState('');
    const {phoneNumber} = useParams();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === "cardNumber" || name === "cvv") {
            const numbersOnly = value.replace(/[^\d]/g, '');
            setFormData({ ...formData, [name]: numbersOnly });
        } else {
            // Esto manejará correctamente el campo 'cardHolder' y cualquier otro campo no numérico
            setFormData({ ...formData, [name]: value });
        }
    };


    const navigateToHome = () => {
        navigate(`/homePage/${phoneNumber}`)
    }


    const validateFields = () => {
        const { cardNumber, cardHolder, expiryMonth, expiryYear, cvv } = formData;
        if (!cardNumber) {
            setError('El campo del número de tarjeta está vacío.');
            return false;
        } else if (cardNumber.length !== 16) {
            setError('El número de la tarjeta debe tener 16 dígitos.');
            return false;
        }

        if (!cardHolder) {
            setError('El campo del titular de la tarjeta está vacío.');
            return false;
        }

        if (!expiryMonth || !expiryYear) {
            setError('Seleccione el mes y el año de caducidad.');
            return false;
        }

        if (!cvv) {
            setError('El campo del CVV está vacío.');
            return false;
        } else if (cvv.length !== 3) {
            setError('El CVV debe tener 3 dígitos.');
            return false;
        }

        setError('');
        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Verifica que los campos son válidos antes de enviar
        if (!validateFields()) {
            return;
        }

        // Datos del formulario para enviar a la API
        const paymentData = {
            tipo: formData.issuer,
            numTarjeta: formData.cardNumber,
            fechaVencimiento: `${formData.expiryMonth}/${formData.expiryYear}`,
            cvv: formData.cvv,
            titular: formData.cardHolder
        };

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/addPaymentMethod`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(paymentData)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Método de pago agregado con éxito.');
                navigateToHome()
            } else {
                if (result.message === "Tarjeta previamente registrada") {
                    setError('La tarjeta ya está registrada en su cuenta.');
                } else {
                    setError(result.message || 'Ocurrió un error al intentar agregar el método de pago.');
                }
            }
        } catch (error) {
            setError('Error al conectar con el servicio. Por favor, intente más tarde.');
        }
    };


    return (
        <div className="payment-method-form-container">
            <Card className="payment-method-card">
                <Card.Body>
                    <a onClick={navigateToHome} className="return-link">← Regresar</a>
                    <h2 className="form-title">Nuevo método de pago</h2>
                    {error && <Alert variant="danger" className="error-message">{error}</Alert>}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Número de tarjeta</Form.Label>
                            <Form.Control
                                type="text"
                                name="cardNumber"
                                value={formData.cardNumber}
                                onChange={handleInputChange}
                                placeholder="0000-0000-0000-0000"
                                maxLength="16"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Titular de la tarjeta</Form.Label>
                            <Form.Control
                                type="text"
                                name="cardHolder"
                                value={formData.cardHolder}
                                onChange={handleInputChange}
                                placeholder="Nombre Apellido"
                            />
                        </Form.Group>

                        <div className="d-flex justify-content-between">
                            <Form.Group className="mb-3" style={{ width: '50%' }}>
                                <Form.Label>Fecha de caducidad</Form.Label>
                                <div className="d-flex">
                                    <Form.Select name="expiryMonth" value={formData.expiryMonth} onChange={handleInputChange} style={{ marginRight: '5px' }}>
                                        <option value="">Mes</option>
                                        {/* Generar opciones de mes */}
                                        {[...Array(12)].map((_, i) => (
                                            <option key={i} value={i + 1}>{(`0${i + 1}`).slice(-2)}</option>
                                        ))}
                                    </Form.Select>
                                    <Form.Select name="expiryYear" value={formData.expiryYear} onChange={handleInputChange}>
                                        <option value="">Año</option>
                                        {/* Generar opciones de año */}
                                        {new Array(10).fill(new Date().getFullYear()).map((year, i) => (
                                            <option key={i} value={year + i}>{year + i}</option>
                                        ))}
                                    </Form.Select>
                                </div>
                            </Form.Group>

                            <Form.Group className="mb-3" style={{ width: '30%' }}>
                                <Form.Label>CVV</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="cvv"
                                    value={formData.cvv}
                                    onChange={handleInputChange}
                                    placeholder="000"
                                    maxLength="3" 
                                />
                            </Form.Group>
                        </div>

                        {/* Campo Emisor */}
                        <Form.Group className="mb-3">
                            <Form.Label>Emisor</Form.Label>
                            <Form.Select>
                                <option>Visa</option>
                                <option>Mastercard</option>
                            </Form.Select>
                        </Form.Group>
                        <Button variant="warning" type="submit" className="submit-button">
                            Agregar
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
}

export default PaymentMethodForm;
