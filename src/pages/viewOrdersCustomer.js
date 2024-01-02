import React, { useState, useEffect } from 'react';
import { Container, Card, CardBody, Row, Col, Button, Collapse, Image, Modal } from 'react-bootstrap';
import { formatDate } from '../Logic/utilities';
import '../components/styles/viewOrdersCustomer.css';
import { getPhoneNumber, cancelOrder, getProductDetails } from '../Logic/customerPetitions';

const OrderHistory = () => {
    const [ordersData, setOrdersData] = useState([]);
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [fileUploadError, setFileUploadError] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrderNum, setSelectedOrderNum] = useState(null);
    const [description, setDescription] = useState('');
    const [file, setFile] = useState(null);
    const [fileUploadSuccess, setFileUploadSuccess] = useState(false);
    const [validationError, setValidationError] = useState(false);

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    const handleReportOrder = async () => {
        if (description.trim() && file) {
            try {
                const base64Image = await fileToBase64(file);

                const reportData = {
                    descripcion: description,
                    fotografia: base64Image
                };

                const response = await fetch(`http://localhost:6969/api/v1/customer/report-incident/${selectedOrderNum}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(reportData)
                });

                if (response.ok) {
                    const result = await response.json();
                    const updatedOrders = ordersData.map(order => {
                        if (order.numPedido === selectedOrderNum) {
                            return result.order; 
                        }
                        return order;
                    });
                    setOrdersData(ordersData.map(order => {
                        if (order.numPedido === selectedOrderNum) {
                            return {
                                ...order,
                                incidente: result.order.incidente,
                                fechaPedido: formatDate(new Date(order.fechaPedido)),
                            };
                        }
                        return order;
                    }));
                    handleCloseModal(); 
                } else {
                    throw new Error('La respuesta del servidor no fue OK.');
                }
            } catch (error) {
            }
        } else {
            setValidationError(true); 
        }
    };

    const handleDescriptionChange = (event) => {
        setDescription(event.target.value);
    };

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileUploadSuccess(true);
            setValidationError(false);
        } else {
            setFileUploadSuccess(false);
            setFile(null);
        }
    };

    const handleShowModal = (numPedido) => {
        setSelectedOrderNum(numPedido);
        setShowModal(true);
        setFile(null);
        setDescription('');
        setFileUploadSuccess(false);
        setValidationError(false);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

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
                                    {order.estado === "Entregado" && (!order.incidente || !order.incidente.IdIncidente) && (
                                        <Button
                                            variant="warning"
                                            className="btn-custom report-order-button"
                                            onClick={() => handleShowModal(order.numPedido)}
                                        >
                                            Reportar pedido
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
            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>REPORTAR PEDIDO</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <form>
                        <label htmlFor="problem-description">Describe el problema que presenta tu pedido:</label>
                        <textarea
                            className="form-control"
                            id="problem-description"
                            rows="3"
                            value={description}
                            onChange={handleDescriptionChange}
                        ></textarea>

                        <label htmlFor="evidence-upload" className="btn btn-success btn-block mt-3">
                            Subir la evidencia
                            <input
                                type="file"
                                id="evidence-upload"
                                accept=".png,.jpg,.jpeg"
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                        </label>
                        {fileUploadSuccess && <p style={{ color: 'green' }}>Foto cargada de manera exitosa</p>}
                        {!file && <p style={{ color: '#ff6600' }}>Seleccione la foto de su prueba, por favor</p>}
                    </form>
                    {validationError && <p style={{ color: 'red' }}>Rellene los datos faltantes, por favor.</p>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handleReportOrder}>
                        Enviar
                    </Button>
                </Modal.Footer>
            </Modal>

        </Container>
    );
};

export { OrderHistory };
