import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Navbar, Card, Button, Spinner } from 'react-bootstrap';
import logo from '../components/img/logo.png'
import profile from '../components/img/profile.png'
import { formatDate } from '../Logic/utilities';
import OrderDetails from './ordersDetails';

const ViewOrderDeliveryMan = () => {
    const { employeeNumber } = useParams();
    const [ordersAsigned, SetOrdersAsigned] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const navigate = useNavigate();


    const getOrdersAsigned = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/employee/getDeliveryOrders/${employeeNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            } else {
                const data = await response.json();
                SetOrdersAsigned(data.response)
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    }

    const viewOrderDetails = (orderId) => {
        setSelectedOrderId(orderId);
        navigate(`/orderDetails/${orderId}`);
    };

    useEffect(() => {
        setLoading(true);
        getOrdersAsigned();
    }, [])


    return (
        <>
            <Navbar className=" nav">
                <Container>
                    <Navbar.Brand href="#home">
                        <img src={logo} width="40" height="40" className="d-inline-block align-top" alt="Cuebarrotes logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <a href="#" style={{ cursor: 'pointer' }}>
                            <img src={profile} width="40" height="40" className="d-inline-block align-top" alt='Profile Pic' />
                        </a>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <h5 className='title'>Pedidos Asignados</h5>


            {loading ? (
                <Container className="text-center mt-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : null}

            {ordersAsigned.length > 0 ? (
                <Container>
                    {ordersAsigned.map((order, index) => (
                        <Card key={order.numPedido} className='order-card' onClick={() => viewOrderDetails(order.numPedido)} style={{ cursor: 'pointer' }}>
                            <Card.Body>
                                <Container className='d-flex justify-content-evenly'>
                                    <p className='text'><b>Fecha:</b></p>
                                    <p className='text'><b>Dirección:</b></p>
                                    <p className='text'><b>Estado:</b></p>
                                </Container>
                                <Container className='d-flex justify-content-evenly'>
                                    <p className='text'>{formatDate(new Date(order.fechaPedido))}</p>
                                    <p className='text'>{order.direccion}</p>
                                    <p className='text'>{order.estado}</p>
                                </Container>
                            </Card.Body>
                        </Card>
                    ))}
                </Container>
            ) : (
                <Container className="text-center mt-4">
                    <h1 className='title mt-4'> No hay pedidos asignados :(</h1>
                </Container>
            )}

            {selectedOrderId && <OrderDetails orderId={selectedOrderId} />}

        </>
    );
}

export { ViewOrderDeliveryMan }