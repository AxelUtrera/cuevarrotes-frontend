import React, { useState, useEffect } from "react";
import { Container, Card, CardBody, Row, Col } from "react-bootstrap";
import { SecondaryButton } from "../components/componentsUI";
import { formatDate } from "../Logic/utilities";
import '../components/componentsUI.css'

const phoneNumber = '0'

const OrderHistory = () => {
    const [ordersData, setOrdersData] = useState([]);


    useEffect(() => {
        getOrdersInfo(phoneNumber)
    }, []);


    const handleOrderDetails = (numPedido) => {
        console.log(numPedido);
    };

    const getOrdersInfo = async (phoneNumber) => {
        try {
            const response = await fetch(`http://127.0.0.1:9000/api/v1/customer/getOrders/${phoneNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const data = await response.json();

            setOrdersData(data.response.map(order => ({
                ...order,
                // Formatear la fecha aquí (si 'fechaPedido' es la propiedad que contiene la fecha)
                fechaPedido: formatDate(new Date(order.fechaPedido))
            })));
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }

    return (
        <Container>
            <h3 className="title">Mis pedidos</h3>

            {ordersData.map((order, index) => (
                <Card key={index} className="order-card">
                    <CardBody>
                        <Row>
                            <Col md='6'>
                                <p className="text"><b># Pedido: </b> {order.numPedido}</p>
                                <p className="text"><b>Fecha: </b> {order.fechaPedido}</p>
                                <p className="text"><b>Estado: </b> {order.estado}</p>
                                <p className="text"><b>Total: </b> ${order.total}</p>
                            </Col>
                            <Col md='6' className="d-flex align-items-center">
                                <SecondaryButton buttonText='Ver Pedido' onClickMethod={() => handleOrderDetails(order.numPedido)}></SecondaryButton>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            ))}

        </Container>
    )
}


export { OrderHistory }