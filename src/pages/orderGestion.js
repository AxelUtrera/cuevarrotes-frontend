import React, { useState, useEffect } from "react";
import logo from '../components/img/logo.png'
import { Navbar, Container, Spinner, Card, Col, Row, Button, Modal, Form } from "react-bootstrap";
import { formatDate } from '../Logic/utilities';
import '../components/componentsUI.css';


const OrderGestion = () => {
    const [loading, setLoading] = useState(true);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [deliveryMans, setDeliveryMans] = useState([]);
    const [orderNumber, setOrderNumber] = useState(null);
    

    const getPendingOrders = async () => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/employee/getPendingOrders`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            } else {
                const data = await response.json();
                setPendingOrders(data.response)
                getDeliveryMans()
            }

        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    }


    const getDeliveryMans = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:9000/api/v1/employee/getDeliveryMans`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos para el combo box');
            } else {
                const data = await response.json();
                setDeliveryMans(data.response);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    };



    const rejectOrder = async (orderNumber) => {
        try {
            const response = await fetch(`http://127.0.0.1:9000/api/v1/employee/rejectOrder/${orderNumber}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al rechazar el pedido');
            } else {
                window.location.reload(false);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    };



    const acceptOrder = async () => {

        const selectedValue = document.getElementById("deliveryManSelect").value;

        const info = {
            numEmpleado: selectedValue,
            numPedido: orderNumber
        }

        try {
            const response = await fetch('http://127.0.0.1:9000/api/v1/employee/asignOrder', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(info),
            });
            if (!response.ok) {
                throw new Error('Error al aceptar el pedido');
            } else {
                window.location.reload(false);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        setLoading(true);
        getPendingOrders();
    }, [])


    return (
        <>

            <Navbar className=" nav">
                <Container>
                    <Navbar.Brand href="#home">
                        <img src={logo} width="40" height="40" className="d-inline-block align-top" alt="Cuebarrotes logo" />
                    </Navbar.Brand>
                </Container>
            </Navbar>

            <h5 className='title'>Pedidos Pendientes</h5>


            {loading ? (
                <Container className="text-center mt-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : null}


            {pendingOrders.length > 0 ? (
                <Container>
                    {pendingOrders.map((order, index) => (
                        <Card key={order.orderDetails.numPedido} className='order-card'>
                            <Card.Body>
                                <Row>
                                    <Col sm={8}>
                                        <Container>
                                            <p className="text"><b>Cliente: </b> {order.customer}</p>
                                            <p className="text"><b>Dirección: </b> {order.orderDetails.direccion}</p>
                                            <p className="text"><b>Sucursal: </b> {order.orderDetails.sucursal}</p>
                                            <p className="text"><b>Productos: </b></p>
                                            {order.products.map((product, index) => (
                                                <div key={index}>
                                                    <p className='text'>{product.nombre}</p>
                                                </div>
                                            ))}
                                        </Container>
                                    </Col>
                                    <Col sm={4}>
                                        <Button className="accept-button" onClick={() => { setShowAcceptModal(true); setOrderNumber(order.numPedido) }}>
                                            Aceptar
                                        </Button>
                                        <Button className="secondary-button" onClick={() => rejectOrder(order.numPedido)}>
                                            Rechazar
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    ))}
                </Container>
            ) : (
                <Container className="text-center mt-4">
                    <h1 className='title mt-4'> No hay pedidos pendientes :(</h1>
                </Container>
            )}


            <Modal show={showAcceptModal} onHide={() => setShowAcceptModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Asignar repartidor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Select id="deliveryManSelect">
                        {deliveryMans.map((man, index) => (
                            <option key={index} value={man.numEmpleado}>
                                {man.nombre} {man.apellidoPaterno} - {man.numEmpleado}
                            </option>
                        ))}
                    </Form.Select>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={() => acceptOrder()}>
                        Aceptar
                    </Button>
                </Modal.Footer>
            </Modal>


        </>
    );
}


export { OrderGestion }