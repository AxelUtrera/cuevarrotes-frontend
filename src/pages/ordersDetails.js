import React, { useState, useEffect, useRef } from "react";
import { Container, Spinner, Row, Col, Navbar, Button, Modal, Form } from "react-bootstrap";
import { useParams,  useNavigate } from "react-router-dom";
import { GoogleMap, Marker } from "@react-google-maps/api";
import '../components/componentsUI.css';
import logo from '../components/img/logo.png'

const OrderDetails = () => {
    const [orderDetails, setOrderDetails] = useState(null);
    const [branchLocation, setBranchLocation] = useState(null);
    const [orderProducts, setOrderProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [destinationMarker, setDestinationMarker] = useState(null);
    const directionsService = useRef(null);
    const directionsRenderer = useRef(null);
    const [map, setMap] = useState(null);
    const mapStyles = {
        height: '500px',
        width: '100%',
    };
    const defaultCenter = {
        lat: 19.544069250090857,
        lng: -96.91649521901252,
    };
    const mapOptions = {
        fullscreenControl: false,
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false
    };
    const { orderNumber } = useParams();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();


    const clicShowModal = () => {
        setShowModal(true);
    };

    const clicCloseModal = () => {
        setShowModal(false);
    };


    const getOrdersDetails = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:9000/api/v1/employee/getOrderDetails/${orderNumber}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            } else {
                const data = await response.json();

                setOrderDetails(data.order);
                setOrderProducts(data.productsInfo);

                const branchCoordinates = {
                    lng: parseFloat(data.branchLocation.longitud),
                    lat: parseFloat(data.branchLocation.latitud)
                };

                const destinationCoordinates = {
                    lng: parseFloat(data.order.ubicacion.longitud),
                    lat: parseFloat(data.order.ubicacion.latitud)
                };

                setDestinationMarker(destinationCoordinates);
                setBranchLocation(branchCoordinates);
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    };


    const deliverOrder = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:9000/api/v1/employee/deliverOrder/${orderNumber}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            } else {
                navigate('/')
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } 
    };


    


    const onLoad = (map) => {
        setMap(map);
        directionsRenderer.current = new window.google.maps.DirectionsRenderer();
        directionsRenderer.current.setMap(map);
        directionsService.current = new window.google.maps.DirectionsService();
        calculateAndDisplayRoute();
    };

    const calculateAndDisplayRoute = () => {
        if (map && branchLocation && destinationMarker && directionsService.current && directionsRenderer.current) {
            const request = {
                origin: branchLocation,
                destination: destinationMarker,
                travelMode: window.google.maps.TravelMode.DRIVING,
            };
            directionsService.current.route(request, (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    directionsRenderer.current.setDirections(result);
                } else {
                    console.error('Error al calcular la ruta:', status);
                }
            });
        }
    };


    const deliverOrderWithProblems = async () => {
        const reasonInputValue = document.getElementById('reasonInput').value;
        if (!reasonInputValue) {
            alert('El campo de razón es requerido');
            return;
        }
        const reason = {
            reason: reasonInputValue
        }

        try {
            const response = await fetch(`http://127.0.0.1:9000/api/v1/employee/deliverOrderWithProblems/${orderNumber}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reason),
            });
            

            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            } else {
                navigate('/')
            }
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } 
    };

    useEffect(() => {
        if (window.google) {
            getOrdersDetails();
        } else {
            window.addEventListener('google-maps-ready', getOrdersDetails);
        }

        return () => {
            window.removeEventListener('google-maps-ready', getOrdersDetails);
        };
    }, []);

    return (
        <>

            <Navbar className=" nav">
                <Container>
                    <Navbar.Brand href="#home">
                        <img src={logo} width="40" height="40" className="d-inline-block align-top" alt="Cuebarrotes logo" />
                    </Navbar.Brand>
                </Container>
            </Navbar>


            {loading ? (
                <Container className="text-center mt-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : (
                <Container>
                    <h5 className="title">Detalles del pedido</h5>

                    <Row>
                        <Col sm={6}>
                            <GoogleMap
                                zoom={15}
                                mapContainerStyle={mapStyles}
                                center={defaultCenter}
                                options={mapOptions}
                                onLoad={onLoad}
                            >
                            </GoogleMap>
                        </Col>

                        <Col sm={6}>
                            <p className="text"><b>Dirección: </b></p>
                            <p className="text"> {orderDetails.direccion}</p>
                            <br />
                            <p className="text"><b>Estado: </b></p>
                            <p className="text"> {orderDetails.estado}</p>
                            <br />
                            <p className="text"><b>Productos: </b></p>
                            {orderProducts.map((product, index) => (
                                <div className="d-flex" key={index}>
                                    <p className='text'>{product.cantidad} x</p>
                                    <p className='text'>{product.nombre}</p>
                                </div>
                            ))}


                            {orderDetails.estado === 'En proceso de entrega' && (
                                <>
                                    <Button className="secondary-button" onClick={clicShowModal}>Entregar sin finalizar</Button>
                                    <Button className="secondary-button" onClick={deliverOrder}>Entregar pedido</Button>


                                    <Modal show={showModal} onHide={clicCloseModal}>
                                        <Modal.Header closeButton>
                                            <Modal.Title>¿Por qué no se pudo finalizar la entrega?</Modal.Title>
                                        </Modal.Header>
                                        <Modal.Body>
                                            <Form.Group controlId="reasonInput">
                                                <Form.Label>Ingresa la razón:</Form.Label>
                                                <Form.Control required type="text" />
                                            </Form.Group>
                                        </Modal.Body>
                                        <Modal.Footer>
                                            <Button className="accept-button" onClick={deliverOrderWithProblems}>
                                                Aceptar
                                            </Button>
                                        </Modal.Footer>
                                    </Modal>
                                </>
                            )}
                        </Col>
                    </Row>
                </Container>
            )}
        </>
    );
};

export default OrderDetails;
