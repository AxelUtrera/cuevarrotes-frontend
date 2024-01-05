import React, { useEffect, useState } from 'react';
import { haversineDistance } from '../Logic/haversine';
import { Container, Form, Navbar, Card, Row, Col, Button, Spinner, Alert, ButtonGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../components/styles/NavBar.css'
import '../components/componentsUI.css'
import logo from '../components/img/logo.png'
import cart from '../components/img/cart.png'
import profile from '../components/img/profile.png'
import { useParams } from 'react-router-dom';



const ViewProducts = () => {
    const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });
    const [branches, setBranches] = useState([]);
    const [closestBranch, setClosestBranch] = useState(null);
    const [distance, setDistance] = useState(null);
    const [products, setProducts] = useState([]);
    const [originalProducts, setOriginalProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('Todo');
    const { phoneNumber } = useParams();

    const getBranchesInfo = async () => {
        try {
            const response = await fetch('http://127.0.0.1:6969/api/v1/administrator/getBranchesInfo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const data = await response.json();
            setBranches(data.response)
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    }


    const getProductsInfo = async (inventory) => {
        try {
            const response = await fetch('http://127.0.0.1:6969/api/v1/customer/getProductsByBranch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inventory)
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const data = await response.json();
            setProducts(data.response)
            setOriginalProducts(data.response)
        } catch (error) {
            console.error('Error en la solicitud:', error);
        } finally {
            setLoading(false);
        }
    }


    const addProductToCart = async (barCode) => {
        let product = {
            codigoBarras: barCode,
            cantidad: 1
        }
        console.log(barCode)
        console.log(phoneNumber)
        try {
            const response = await fetch(`http://127.0.0.1:6969/api/v1/customer/addProductToCart/${phoneNumber}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(product)
            });
            if (!response.ok) {
                throw new Error('Error al añadir el producto');
            }

            if (response.ok) {
                setShowSuccessMessage(true);
            }


        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }


    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        } else {
            console.log("Geolocation is not available in your browser.");
        }


        getBranchesInfo()
    }, []);



    useEffect(() => {
        if (currentLocation && branches.length > 0) {
            let closestBranch = null;
            let minDistance = Infinity;
            setLoading(true);
            branches.forEach((branch) => {
                const branchCoords = { lat: branch.ubicacion.latitud, lng: branch.ubicacion.longitud };
                const calculatedDistance = haversineDistance(currentLocation, branchCoords);


                if (calculatedDistance < minDistance) {
                    minDistance = calculatedDistance;
                    closestBranch = branch;
                }
            });

            setClosestBranch(closestBranch);

            localStorage.setItem('actualBranch', JSON.stringify(closestBranch));

            setDistance(minDistance);
            if (minDistance > 5) {
                setLoading(false);
            }
        }

    }, [currentLocation, branches]);


    useEffect(() => {
        if (branches.length > 0 && closestBranch && distance <= 5) {
            setLoading(true);
            getProductsInfo(closestBranch.inventario.productos);
        }
    }, [branches, closestBranch, distance]);


    useEffect(() => {
        let timer;
        if (showSuccessMessage) {
            timer = setTimeout(() => {
                setShowSuccessMessage(false);
            }, 3000);
        }
        return () => {
            clearTimeout(timer);
        };
    }, [showSuccessMessage]);


    useEffect(() => {
        const filteredProducts = selectedCategory === 'Todo'
            ? originalProducts
            : originalProducts.filter(product => product.categoria === selectedCategory);

        setProducts(filteredProducts);
    }, [selectedCategory, originalProducts]);



    return (
        <>

            <Navbar className=" nav">
                <Container>
                    <Navbar.Brand href="#home">
                        <img src={logo} width="40" height="40" className="d-inline-block align-top" alt="Cuebarrotes logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                        <Link to="/checkout">
                            <img src={cart} width="40" height="40" className="d-inline-block align-top" alt="Customer Cart" />
                        </Link>
                        <a href="#" style={{ cursor: 'pointer' }}>
                            <img src={profile} width="40" height="40" className="d-inline-block align-top" alt='Profile Pic' />
                        </a>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {loading ? (
                <Container className="text-center mt-4">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </Container>
            ) : distance && distance > 5 ? (
                <Container>
                    <h1 className='title'> Lo sentimos, no hay sucursales cerca de ti :(</h1>
                </Container>
            ) : closestBranch ? (
                <Container className='mt-4'>
                    {showSuccessMessage && (
                        <Container className="text-center mt-4">
                            <Alert variant="success">
                                Producto agregado al carrito
                            </Alert>
                        </Container>
                    )}

                    <ButtonGroup aria-label="Category filter" className='w-100'>
                        <Button className='button-primary' onClick={() => setSelectedCategory('Todo')}>Todo</Button>
                        <Button className='button-primary' onClick={() => setSelectedCategory('Alimentos')}>Alimentos</Button>
                        <Button className='button-primary' onClick={() => setSelectedCategory('Bebidas')}>Bebidas</Button>
                        <Button className='button-primary' onClick={() => setSelectedCategory('Abarrotes')}>Abarrotes</Button>
                    </ButtonGroup>


                    {products.length > 0 ? (
                        <Row xs={1} md={5} className="g-4 mt-2">
                            {products.map((product, index) => (
                                <Col key={index}>
                                    <Card className='order-card'>
                                        <Card.Body>
                                            <Card.Img className='order-card' variant="top" height="100" src={product.imagen} />
                                            <Card.Title className='order-card-text'>{product.nombre}</Card.Title>
                                            <Container className='d-flex justify-content-evenly'>
                                                <p className='price w-50'>${product.precioUnitario}</p>
                                                <Button className='button-card' size='sm' onClick={() => addProductToCart(product.codigoBarras)}>+</Button>
                                            </Container>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <Container className="text-center mt-4">
                            <h1 className='title mt-4'> No hay productos disponibles en este momento :(</h1>
                        </Container>
                    )}
                </Container>
            ) : null}
        </>
    );
}

export default ViewProducts;
