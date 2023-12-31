import React, { useState, useEffect } from 'react';
import { AcceptButton, ExceptionMessage } from "../components/componentsUI";
import { Container, Form, Row, Col } from "react-bootstrap";
import { formatDate } from '../Logic/utilities';
import '../components/componentsUI.css'
import { useParams, useNavigate } from 'react-router-dom';


const EditProfileCustomer = () => {
    const [editStatus, setEditStatus] = useState(null);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        fechaNacimiento: '',
        numTelefono: ''
    });
    const { phoneNumber } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        getCustomerInfo();
    }, []);


    const getCustomerInfo = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/getCustomerByPhone/${phoneNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const datosPerfil = await response.json();

                setFormData({
                    nombre: datosPerfil.response.nombre,
                    apellidos: datosPerfil.response.apellidos,
                    fechaNacimiento: formatDate( new Date(datosPerfil.response.fechaNacimiento)),
                    numTelefono : datosPerfil.response.numTelefono
                });
            } else {
                console.error('Error al obtener datos del perfil');
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    };


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value, });
    };


    const sendCustomerData = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (
            formData.nombre.trim() === '' ||
            formData.apellidos.trim() === '' ||
            formData.fechaNacimiento.trim() === ''
        ) {
            setValidated(true);
            return;
        }

        if (form.checkValidity()) {
            try {

                const editResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/modifyProfile/${formData.numTelefono}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                if (editResponse.ok) {
                    setEditStatus('success');
                    navigateToHome()

                } else {
                    setEditStatus('error');
                }

            } catch (error) {
                console.error('Error en la solicitud:', error);
                setEditStatus('error');
            }
        }
    };


    const navigateToHome = () =>{
        navigate(`/homePage/${phoneNumber}`)
    }

    const navigateToAddAddress = () => {
        navigate(`/addAddress/${phoneNumber}`)
    }

    const navigateToAddPayment = () => {
        navigate(`/paymentMethod/${phoneNumber}`)
    }

    const navigateToHistory = () => {
        navigate(`/orderHistory/${phoneNumber}`)
    }


    return (
        <Container className="center-container">
            <a className='text' onClick={navigateToHome} style={{cursor: 'pointer'}}>Regresar</a>

            <h3 className="title">Este eres tú :)</h3>

            <Form noValidate validated={validated} onSubmit={sendCustomerData}>

                <Row className="mb-3">
                    <Form.Group controlId="formFirstName" as={Col} md="6">
                        <Form.Label className="text">Nombre</Form.Label>
                        <Form.Control required type="text" name='nombre' value={formData.nombre} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group controlId="formLastName" as={Col} md="6">
                        <Form.Label className="text">Apellidos</Form.Label>
                        <Form.Control required type="text" name='apellidos' value={formData.apellidos} onChange={handleChange} />
                    </Form.Group>
                </Row>

                <Form.Group controlId="formBirthDate">
                    <Form.Label className="text">Fecha de Nacimiento</Form.Label>
                    <Form.Control required type="date" name='fechaNacimiento' value={formData.fechaNacimiento} onChange={handleChange} />
                </Form.Group>


                <AcceptButton buttonText='Guardar' onClickMethod={sendCustomerData} />
                <AcceptButton buttonText='Historial de pedidos' onClickMethod={navigateToHistory} />
                <AcceptButton buttonText='Agregar Dirección' onClickMethod={navigateToAddAddress} />
                <AcceptButton buttonText='Agregar Metodo de Pago' onClickMethod={navigateToAddPayment} />
                
                {editStatus === 'success' && (
                    <div className="text-success">Perfil Actualizado Correctamente</div>
                )}

                {editStatus === 'error' && (
                    <ExceptionMessage message="Error en el guardado. Por favor, inténtalo de nuevo." />
                )}

            </Form>
        </Container>
    );
}


export { EditProfileCustomer }