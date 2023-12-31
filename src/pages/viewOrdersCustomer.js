import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, Row, Col, Button, Collapse, Image } from 'react-bootstrap';
import { formatDate } from '../Logic/utilities';
import '../components/styles/viewOrdersCustomer.css';
import { getPhoneNumber, cancelOrder, getProductDetails } from '../Logic/customerPetitions';

const OrderHistory = () => {
    const [ordersData, setOrdersData] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');

    const getOrdersWithProductDetails = async (orders) => {
        const ordersWithDetails = await Promise.all(orders.map(async (order) => {
            const productosConDetalles = await Promise.all(order.productos.map(async (producto) => {
                const details = await getProductDetails(producto.codigoBarras);
                return { ...producto, ...details };
            }));

            return { ...order, productos: productosConDetalles };
        }));

        setOrdersData(ordersWithDetails);
    };

    useEffect(() => {
        const fetchPhoneNumber = async () => {
            const phone = await getPhoneNumber();
            setPhoneNumber(phone);
        };

        fetchPhoneNumber();
    }, []);

    useEffect(() => {
        const getOrdersInfoFetch = async (phoneNumber) => {
            try {
                const response = await fetch(`http://localhost:6969/api/v1/customer/getOrders/${phoneNumber}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!response.ok) {
                    throw new Error('Error al obtener los datos');
                }
                const data = await response.json();
                const ordersWithFormattedDates = data.response.map(order => ({
                    ...order,
                    fechaPedido: formatDate(new Date(order.fechaPedido)),
                }));
                setOrdersData(ordersWithFormattedDates);
                await getOrdersWithProductDetails(ordersWithFormattedDates);
            } catch (error) {
                console.error('Error en la solicitud:', error);
            }
        };

        getOrdersInfoFetch(phoneNumber);
    }, [phoneNumber]);

    const handleToggleOrderDetails = (numPedido) => {
        setExpandedOrder(expandedOrder === numPedido ? null : numPedido);
    };

    const handleCancelOrder = (numPedido) => {

        const userConfirmed = window.confirm("¿Estás seguro de que quieres cancelar este pedido?");

        
        if (userConfirmed) {
            
            cancelOrder(numPedido)
                .then(response => {
                    setOrdersData(ordersData.map(order => {
                        if (order.numPedido === numPedido) {
                            return { ...order, estado: 'Cancelado' };
                        }
                        return order; 
                    }));
                })
                .catch(error => {
                    
                    console.error('Error al cancelar el pedido:', error);
                });
        }
    };

    const handleGoBack = () => {
        // Implementar la lógica para regresar
    };

    return (
        <Container>
            <Button variant="link" className="back-button" onClick={handleGoBack}>Regresar</Button>
            <h1 className="title">Mis Pedidos</h1>
            {ordersData.map((order, index) => (
                <Card key={order._id} className="order-card my-3">
                    <CardBody>
                        <Row className="justify-content-between align-items-center">
                            <Col xs={12} md={8}>
                                <p className="text m-0"><b>Fecha:</b> {order.fechaPedido}</p>
                                <p className="text m-0"><b>Estado:</b> {order.estado}</p>
                            </Col>
                            <Col xs={12} md={4} className="text-center mt-3 mt-md-0">
                                <div className="button-container">
                                    <Button variant="success" className="btn-custom w-75" onClick={() => handleToggleOrderDetails(order.numPedido)}>
                                        {expandedOrder === order.numPedido ? 'Colapsar' : 'Ver pedido'}
                                    </Button>
                                    {order.estado === "Preparandose" && (
                                        <Button
                                            variant="danger"
                                            className="btn-custom w-75"
                                            onClick={() => handleCancelOrder(order.numPedido)}
                                        >
                                            <strong>Cancelar pedido</strong>
                                        </Button>
                                    )}
                                </div>
                            </Col>
                        </Row>
                        <Collapse in={expandedOrder === order.numPedido}>
                            <div className="product-list" id={`collapse-order-${order.numPedido}`}>
                                {order.productos.map(producto => (
                                    <div key={producto._id} className="product-item">
                                        <Image src={producto.image} alt={producto.name} />
                                        <div className="product-text">
                                            <strong>{producto.name}</strong>
                                            <p>Cantidad: {producto.cantidad}</p>
                                            <p>Precio: ${producto.price}</p>
                                        </div>
                                    </div>
                                ))}
                                <div className="order-details">
                                    <div className="order-detail">
                                        <span className="order-detail-title">Importe total:</span>
                                        <span>${order.total}</span>
                                    </div>
                                    <div className="order-detail">
                                        <span className="order-detail-title">Sucursal:</span>
                                        <span>{order.sucursal}</span>
                                    </div>
                                    <div className="order-detail">
                                        <span className="order-detail-title">Método de pago:</span>
                                        <span>{order.metodoPago}</span>
                                    </div>
                                    <div className="order-detail">
                                        <span className="order-detail-title">Dirección:</span>
                                        <span>{order.direccion}</span>
                                    </div>
                                    <div className="order-detail">
                                        <span className="order-detail-title">Repartidor:</span>
                                        <span>{order.repartidor}</span>
                                    </div>
                                    {order.incidente && order.incidente.IdIncidente && (
                                        <div className="order-detail">
                                            <span className="order-detail-title">Incidente:</span>
                                            <span>{order.incidente.descripcion}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Collapse>
                    </CardBody>
                </Card>
            ))}
        </Container>
    );
};

export { OrderHistory };
