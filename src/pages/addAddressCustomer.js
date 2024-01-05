import React, { useState, useRef, useEffect } from 'react';
import { AcceptButton, ExceptionMessage } from "../components/componentsUI";
import { Container, Form, Row, Col } from "react-bootstrap";
import '../components/componentsUI.css'
import { useParams, useNavigate } from 'react-router-dom';

const AddAddressCustomer = () => {
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [validated, setValidated] = useState(false);
    const [formData, setFormData] = useState({
        cp: '',
        colonia: '',
        calle: '',
        numInterior: '',
        numExterior: '',
        ciudad: '',
        estado: '',
        referencias: '',
        ubicacion: {
            lat: '',
            lng: ''
        }
    });
    const {phoneNumber} = useParams();
    const navigate = useNavigate();
    const autoCompleteRef = useRef();
    const inputRef = useRef();

    const options = {
        componentRestrictions: { country: "mx" },
        fields: ["address_components", "geometry", "icon", "name"],
    };

    useEffect(() => {

        if (!window.google || !window.google.maps || !window.google.maps.places) {
            console.error("Error: La API de Google Maps no está cargada correctamente.");
            return;
        }

        autoCompleteRef.current = new window.google.maps.places.Autocomplete(
            inputRef.current,
            options
        );
    
        autoCompleteRef.current.addListener("place_changed", handlePlaceChanged);
    
    }, [formData]);


    const handlePlaceChanged = () => {
        try {
            const place = autoCompleteRef.current.getPlace();
    
            if (!place.geometry || !place.geometry.location) {
                console.error("La ubicación seleccionada no tiene información de geometría.");
                return;
            }
    
            const { lat, lng } = place.geometry.location.toJSON();
    
            setFormData(prevFormData => ({
                ...prevFormData,
                ubicacion: {
                    lat: lat,
                    lng: lng
                },
                calle: place.address_components.find(component =>
                    component.types.includes("route")
                )?.long_name || "",
                numExterior: place.address_components.find(component =>
                    component.types.includes("street_number")
                )?.long_name || "",
                cp: place.address_components.find(component =>
                    component.types.includes("postal_code")
                )?.long_name || "",
                colonia: place.address_components.find(component =>
                    component.types.includes("sublocality_level_1") || component.types.includes("neighborhood")
                )?.long_name || "",
                ciudad: place.address_components.find(component =>
                    component.types.includes("locality")
                )?.long_name || "",
                estado: place.address_components.find(component =>
                    component.types.includes("administrative_area_level_1")
                )?.long_name || "",
            }));
        } catch (error) {
            console.error('Error al manejar el cambio de lugar:', error);
        }
    };
    

    const navigateToHome = () =>{
        navigate(`/homePage/${phoneNumber}`)
    }
    

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value, });
    };


    const sendAddressInfo = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (
            formData.cp.trim() === '' ||
            formData.colonia.trim() === '' ||
            formData.calle.trim() === '' ||
            formData.numInterior.trim() === '' ||
            formData.numExterior.trim() === '' ||
            formData.ciudad.trim() === '' ||
            formData.estado.trim() === '' ||
            formData.referencias.trim === ''
        ) {
            setValidated(true);
            return;
        }

        if (form.checkValidity()) {
            try {
                const registerResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/customer/addNewAddress/${phoneNumber}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (registerResponse.ok) {
                    setRegistrationStatus('success');
                    navigateToHome()
                } else {
                    setRegistrationStatus('error');
                }

            } catch (error) {
                console.error('Error en la solicitud:', error);
                setRegistrationStatus('error');
            }
        }
    };


    return (

        <Container className='center-container'>
            <h3 className="title">Nueva Dirección</h3>

            <Form noValidate validated={validated} onSubmit={sendAddressInfo}>

                <Form.Group>
                    <Form.Label className="text">Dirección</Form.Label>
                    <Form.Control required type="text" ref={inputRef} />

                </Form.Group>

                <Form.Group controlId="formStreet">
                    <Form.Label className="text">Calle</Form.Label>
                    <Form.Control required type="text" name='calle' value={formData.calle} onChange={handleChange} />
                </Form.Group>

                <Row className="mb-3">
                    <Form.Group controlId="formExtNum" as={Col} md="4">
                        <Form.Label className="text">Num. Exterior</Form.Label>
                        <Form.Control required type="text" name='numExterior' value={formData.numExterior} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group controlId="formNumInt" as={Col} md="4">
                        <Form.Label className="text">Num. Interior</Form.Label>
                        <Form.Control required type="text" name='numInterior' value={formData.numInterior} onChange={handleChange} />
                    </Form.Group>

                    <Form.Group controlId="formZipCode" as={Col} md="4">
                        <Form.Label className="text">Codigo Postal</Form.Label>
                        <Form.Control required type="text" name='cp' value={formData.cp} onChange={handleChange} />
                    </Form.Group>
                </Row>

                <Form.Group controlId="formColony">
                    <Form.Label className="text">Colonia</Form.Label>
                    <Form.Control required type="text" name='colonia' value={formData.colonia} onChange={handleChange} />
                </Form.Group>

                <Form.Group controlId="formCity">
                    <Form.Label className="text">Ciudad</Form.Label>
                    <Form.Control required type="text" name='ciudad' value={formData.ciudad} onChange={handleChange} />
                </Form.Group>

                <Form.Group controlId="formState">
                    <Form.Label className="text">Estado</Form.Label>
                    <Form.Control required type="text" name='estado' value={formData.estado} onChange={handleChange} />
                </Form.Group>

                <Form.Group controlId="formReferences">
                    <Form.Label className="text">Referencias</Form.Label>
                    <Form.Control required type="text" name='referencias' value={formData.referencias} onChange={handleChange} />
                </Form.Group>


                <AcceptButton buttonText='Guardar Dirección' onClickMethod={sendAddressInfo} />
                <AcceptButton buttonText='Regresar' onClickMethod={navigateToHome} />

                {registrationStatus === 'success' && (
                    <div className="text-success">Dirección guardada con éxito</div>
                )}

                {registrationStatus === 'error' && (
                    <ExceptionMessage message="Error en el registro. Por favor, inténtalo de nuevo." />
                )}

            </Form>
        </Container>

    );
}


export { AddAddressCustomer }