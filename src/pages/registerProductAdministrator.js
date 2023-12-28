import React, { useState, useEffect, } from 'react';
import { AcceptButton, ExceptionMessage } from "../components/componentsUI";
import { Container, Form, Row, Col, FormSelect, Button } from "react-bootstrap";


const RegisterProduct = () => {
    const [registrationStatus, setRegistrationStatus] = useState(null);
    const [validated, setValidated] = useState(false);
    const [formBranches, setDataBranches] = useState([]);
    const [formData, setFormData] = useState({
        nombre: '',
        codigoBarras: '',
        categoria: '',
        fechaCaducidad: '',
        precioUnitario: '',
        descripcion: '',
        imagen: ''
    });


    useEffect(() => {
        getBranchesInfo()
    }, []);


    const getBranchesInfo = async () => {
        try {
            const response = await fetch('http://127.0.0.1:9000/api/v1/administrator/getBranchesInfo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new Error('Error al obtener los datos');
            }
            const data = await response.json();

            setDataBranches(data.response)
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }


    const handleNumeroChange = (index, value) => {
        setDataBranches((prevData) =>
            prevData.map((object, i) =>
                i === index ? { ...object, numeroIngresado: value } : object
            )
        );
    };


    const addProductToBranch = (index) => {
        const newData = [...formBranches];

        newData[index].inventario.productos.push({
            codigoBarras: formData.codigoBarras,
            existencias: parseInt(formBranches[index].numeroIngresado),
        });

        delete newData[index].numeroIngresado;
        setDataBranches(newData);
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        const newValue = name === 'precioUnitario' ? parseInt(value) : value;
        setFormData({ ...formData, [name]: newValue });
    };


    const sendProductData = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;

        if (
            formData.nombre.trim() === '' ||
            formData.codigoBarras.trim() === '' ||
            formData.categoria.trim() === '' ||
            formData.fechaCaducidad.trim() === '' ||
            formData.descripcion.trim() === '' ||
            formData.imagen.trim() === ''
        ) {
            setValidated(true);
            return;
        }

        
        if (form.checkValidity()) {

            try {
                const registerResponse = await fetch('http://127.0.0.1:9000/api/v1/administrator/createProduct', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                if (registerResponse.ok) {

                    await fetch('http://127.0.0.1:9000/api/v1/administrator/addProductToBranch', {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formBranches)
                    });

                    setRegistrationStatus('success');
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
        <Container className="product-container">
            <Row>
                <Container as={Col} md="6">
                    <h3 className="title">Nuevo Producto</h3>

                    <Form noValidate validated={validated} onSubmit={sendProductData}>

                        <Form.Group controlId="formName">
                            <Form.Label className="text">Nombre del producto</Form.Label>
                            <Form.Control required type="text" name='nombre' value={formData.nombre} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formBarCode">
                            <Form.Label className="text">Codigo de barras</Form.Label>
                            <Form.Control required type="text" name='codigoBarras' value={formData.codigoBarras} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formPrice">
                            <Form.Label className="text">Precio Unitario</Form.Label>
                            <Form.Control required type="number" name='precioUnitario' value={formData.precioUnitario} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formCategory">
                            <Form.Label className="text">Categoria</Form.Label>
                            <Form.Select required name='categoria' value={formData.categoria} onChange={handleChange}>
                                <option > Seleccione una categoria</option>
                                <option value="Alimentos">Alimentos</option>
                                <option value="Bebidas">Bebidas</option>
                                <option value="Abarrotes">Abarrotes</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="formExpireDate">
                            <Form.Label className="text">Fecha de caducidad</Form.Label>
                            <Form.Control required type="date" name='fechaCaducidad' value={formData.fechaCaducidad} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formImage">
                            <Form.Label className="text">Link de imagen</Form.Label>
                            <Form.Control required type="text" name='imagen' value={formData.imagen} onChange={handleChange} />
                        </Form.Group>

                        <Form.Group controlId="formDescription">
                            <Form.Label className="text">Descripcion</Form.Label>
                            <Form.Control required type="text" name='descripcion' value={formData.descripcion} onChange={handleChange} />
                        </Form.Group>


                        {registrationStatus === 'success' && (
                            <div className="text-success">Registro exitoso</div>
                        )}

                        {registrationStatus === 'error' && (
                            <ExceptionMessage message="Error en el registro. Por favor, inténtalo de nuevo." />
                        )}
                    </Form>
                </Container>

                <Container as={Col} md="6">
                    <h3 className="title">Sucursales</h3>

                    {formBranches.map((objeto, indice) => (
                        <Form key={indice}>
                            <Container className='d-flex mt-4'>
                                <Form.Group controlId={`nombreComercial-${indice}`}>
                                    <Form.Label className="text">{objeto.nombreComercial}</Form.Label>
                                </Form.Group>

                                <Form.Group controlId={`numeroIngresado-${indice}`}>
                                    <Form.Control required type="number" size='sm' name="numeroIngresado" onChange={(e) => handleNumeroChange(indice, e.target.value)} />
                                </Form.Group>
                                <Button className='add-button' size='sm' onClick={() => addProductToBranch(indice)}>
                                    Agregar
                                </Button>
                            </Container>
                        </Form>
                    ))}
                </Container>
            </Row>

            <AcceptButton buttonText='Registrar' onClickMethod={sendProductData} />

        </Container>
    );
}


export { RegisterProduct }