import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import '../components/styles/Checkout.css';
import { useNavigate } from 'react-router-dom';

function App() {
    const [direcciones, setDirecciones] = useState([]);
    const [metodosPago, setMetodosPago] = useState([]);
    const [direccionSeleccionada, setDireccionSeleccionada] = useState('');
    const [selectedDireccion, setSelectedDireccion] = useState('');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [isCartEmpty, setIsCartEmpty] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        if (!token) {
            console.error('No hay token disponible');
            setIsDisabled(true);
            return;
        }

        const headers = new Headers({
            'Authorization': `Bearer ${token}`
        });

        fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/paymentMethods`, { headers })
            .then(response => response.json())
            .then(data => {
                setMetodosPago(data);
                if (data && data.length === 0) {
                    setIsDisabled(true); // Deshabilita el dropdown si no hay métodos de pago
                }
            })
            .catch(error => {
                console.error('Error al cargar los métodos de pago', error);
                setIsDisabled(true);
            });

        fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/addresses`, { headers })
            .then(response => response.json())
            .then(data => {
                setDirecciones(data);
                if (data && data.length === 0) {
                    setIsDisabled(true); // Deshabilita el dropdown si no hay direcciones
                }
            })
            .catch(error => {
                console.error('Error al cargar las direcciones', error);
                setIsDisabled(true);
            });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Obtén el token del localStorage
        if (!token) {
            console.error('No hay token disponible');
            setIsDisabled(true);
            setIsCartEmpty(true); // Asumimos que el carrito está vacío si no hay token
            return;
        }

        const headers = new Headers({
            'Authorization': `Bearer ${token}`
        });

        fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/shoppingCart`, { headers })
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    setIsCartEmpty(true); // El carrito está vacío
                    setError('El carrito de compra está vacío por el momento');
                } else {
                    setCartItems(data);
                    setIsCartEmpty(false); // Hay artículos en el carrito
                }
            })
            .catch(error => {
                console.error('Error al cargar los artículos del carrito', error);
                setIsCartEmpty(true); // Asumimos que el carrito está vacío si hay un error
            });
    }, []);


    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + (item.precioUnitario * item.cantidad), 0);
    };

    const confirmarPedido = async () => {
        if (isCartEmpty || !selectedDireccion || !selectedPaymentMethod) {
            setError('Por favor, selecciona los campos faltantes o agrega artículos al carrito.');
            return;
        }

        const sucursalInfo = JSON.parse(localStorage.getItem("actualBranch"));
        const token = localStorage.getItem('token');

        // Datos del pedido para enviar a la API
        const orderData = {
            metodoPago: `${selectedPaymentMethod.tipo} ${selectedPaymentMethod.numTarjeta.slice(-4)}`,
            direccion: selectedDireccion,
            sucursal: sucursalInfo.nombreComercial
        };

        console.log(orderData);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/registerOrder`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            const data = await response.json();
            if (response.ok) {

                try {
                    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/user/phone`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Error al obtener el número de teléfono');
                    }

                    const data = await response.json();
                    alert("Su pedido está en progreso :)");
                    navigate(`/homepage/${data.phone}`);
                } catch (error) {
                    console.error('Error:', error);
                }


            } else {

                setError(data.message || 'Error al registrar el pedido');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Error al conectar con el servidor');
        }
    };

    const updateCartItem = async (productId, newQuantity) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/shoppingCart`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ codigoBarras: productId, nuevaCantidad: newQuantity })
            });
            const data = await response.json();
            if (response.ok) {

            } else {
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const deleteCartItem = async (productId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/shoppingCart`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ codigoBarras: productId })
            });
            const data = await response.json();
            if (response.ok) {

            } else {

            }
        } catch (error) {

        }
    };

    const handleSelectPaymentMethod = (eventKey) => {
        const metodo = metodosPago.find(metodo => metodo.numTarjeta === eventKey);
        setSelectedPaymentMethod(metodo);
    };

    const handleSelectDireccion = (direccion) => {
        setSelectedDireccion(direccion);
    };

    const handleQuantityChange = (index, delta, productId) => {
        const updatedCartItems = [...cartItems];
        const newQuantity = updatedCartItems[index].cantidad + delta;

        if (newQuantity > 0) {
            updatedCartItems[index].cantidad = newQuantity;
            setCartItems(updatedCartItems);
        }

        updateCartItem(productId, newQuantity);
    };

    const handleRemoveItem = async (index, productId) => {
        const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
        if (confirmDelete) {
            const updatedCartItems = [...cartItems];
            updatedCartItems.splice(index, 1);
            setCartItems(updatedCartItems);
            setIsCartEmpty(updatedCartItems.length === 0);

            await deleteCartItem(productId);
        }
    };

    return (
        <Container fluid className="app">
            <div className="line-divider"></div>
            <Row className="back-button-row">
                <Col>
                    <Link to="/" className="back-button">
                        Regresar
                    </Link>
                </Col>
            </Row>
            <Row className="order-header">
                <Col>
                    <h2 className="section-title">Tu pedido:</h2>
                </Col>
                <Col>
                    <div className="section-top">
                        <h3 className="section-title">Mis artículos:</h3>
                    </div>
                </Col>
            </Row>
            <Row className="main-content">
                <Col xs={12} md={6} className="order-section no-gutters">
                    {/* Sección de dirección */}


                    <Col xs={12} className="text-left">
                        <p className="dropdown-title">Dirección</p>
                        <div className="d-flex align-items-center">
                            <DropdownButton
                                id="dropdown-basic-button"
                                title={selectedDireccion || "Elige una dirección"}
                                className="w-100"
                                disabled={isDisabled}
                                onSelect={handleSelectDireccion}
                            >
                                {direcciones.map((direccion, index) => (
                                    <Dropdown.Item key={index} eventKey={direccion.calle}>
                                        {`${direccion.calle}, ${direccion.numExterior}`}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>
                            <Link to="/agregar-direccion" className="btn btn-success btn-sm btn-round">+</Link>
                        </div>
                    </Col>



                    {/* Sección de método de pago */}


                    <Col xs={12} className="text-left">
                        <p className="dropdown-title">Método de pago</p>
                        <div className="d-flex align-items-center">
                            <DropdownButton
                                id="dropdown-payment-method"
                                title={
                                    selectedPaymentMethod && selectedPaymentMethod.numTarjeta
                                        ? `${selectedPaymentMethod.tipo} **** **** **** ${selectedPaymentMethod.numTarjeta.slice(-4)}`
                                        : "Elige un método de pago"
                                }
                                className="w-100"
                                disabled={isDisabled}
                                onSelect={handleSelectPaymentMethod}
                            >
                                {metodosPago.map((metodo, index) => (
                                    <Dropdown.Item key={index} eventKey={metodo.numTarjeta}>
                                        {`${metodo.tipo} **** **** **** ${metodo.numTarjeta.slice(-4)}`}
                                    </Dropdown.Item>
                                ))}
                            </DropdownButton>

                            <Link to="/paymentMethod" className="btn btn-success btn-sm btn-round">+</Link>
                        </div>

                    </Col>


                    {/* Botón de confirmar pedido */}
                    {error && <Row className="error-message-row"><p className="error-message">{error}</p></Row>}
                    <Button variant="success" className="confirm-button" onClick={confirmarPedido} disabled={isCartEmpty || !selectedDireccion || !selectedPaymentMethod}>Confirmar pedido</Button>
                </Col>
                <Col xs={12} md={6} className="items-section">
                    <div className="section-middle">
                        {cartItems.length > 0 ? (
                            cartItems.map((item, index) => (
                                <div key={item._id} className="item">
                                    <img src={item.imagen !== "no hay imagen" ? item.imagen : 'placeholder-image.jpg'} alt={item.nombre} />
                                    <div className="item-info">
                                        <p>{item.nombre}</p>
                                        <p>Precio: ${item.precioUnitario}</p>
                                        <div className="quantity-controls">
                                            <Button variant="outline-secondary" onClick={() => handleQuantityChange(index, -1, item.codigoBarras)}> - </Button>
                                            <span>{item.cantidad}</span>
                                            <Button variant="outline-secondary" onClick={() => handleQuantityChange(index, 1, item.codigoBarras)}> + </Button>
                                        </div>
                                        <Button variant="outline-danger" onClick={() => handleRemoveItem(index, item.codigoBarras)} className="remove-button">Eliminar</Button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Si el carrito está vacío, se mostrará este mensaje
                            <p className="empty-cart-message">Carrito de compras vacío</p>
                        )}
                    </div>
                    {cartItems.length > 0 && (
                        <div className="section-bottom">
                            <h4>Total a pagar: ${calculateTotal()}</h4>
                        </div>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

export default App;