import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Row, Col } from 'react-bootstrap';
import Autocomplete from 'react-google-autocomplete';
import { createBranch } from '../Logic/administratorPetitions';
import "../components/styles/createBranch.css";

function App() {
  const [nombreComercial, setNombreComercial] = useState('');
  const [direccion, setDireccion] = useState('');
  const [horaApertura, setHoraApertura] = useState('');
  const [horaCierre, setHoraCierre] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [showErrorAPI, setShowErrorAPI] = useState(false);
  const [emptyFields, setEmptyFields] = useState([]);
  const [responseMessage, setResponseMessage] = useState('');
  const [errorAPI, setErrorAPI] = useState('');

  const fetchCoordinates = async (address) => {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=AIzaSyDiCwJfAHjkMAMqDMBKn4HtEqDuo0vLh2E`);
      const data = await response.json();
      if (data.status === "OK") {
        setLatitud(data.results[0].geometry.location.lat);
        setLongitud(data.results[0].geometry.location.lng);
      } else {
        console.error('Error al obtener latitud y longitud:', data.status);
      }
    } catch (error) {
      console.error('Error en la solicitud a la API de Geocoding:', error);
    }
  };

  const handlePlaceSelected = (place) => {
    const placeDireccion = place.formatted_address || '';
    setDireccion(placeDireccion);
    setEmptyFields(prevFields => prevFields.filter(field => field !== 'Dirección'));
    fetchCoordinates(placeDireccion);
  };

  useEffect(() => {
    if (direccion) {
      fetchCoordinates(direccion);
    }
  }, [direccion]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setShowWarning(false);
    setShowErrorAPI(false);
    setResponseMessage('');
    const newEmptyFields = [];
    const trimmedNombreComercial = nombreComercial.trim();
    const trimmedDireccion = direccion.trim();

    const horarioServicio = `${horaApertura}, ${horaCierre}`;

    if (!trimmedNombreComercial) newEmptyFields.push('Nombre comercial');
    if (!trimmedDireccion) newEmptyFields.push('Dirección');
    if (!horaApertura || !horaCierre) newEmptyFields.push('Horario');

    setEmptyFields(newEmptyFields);

    const isValid = newEmptyFields.length === 0;

    setShowWarning(!isValid);

    if (isValid && latitud && longitud) {
      const branchData = {
        nombreComercial: trimmedNombreComercial,
        direccion: trimmedDireccion,
        horarioServicio, 
        ubicacion: {
          latitud: latitud.toString(), 
          longitud: longitud.toString() 
        },
        inventario: { productos: [] } 
      };
      try {
        await createBranch(branchData);
        setResponseMessage('Sucursal creada exitosamente.');
      } catch (error) {
        setShowErrorAPI(true);
        setErrorAPI(`${error.message}`);
      }
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <div className="form-container text-center">
        <Button variant="link" className="back-button text-decoration-none mb-4">
          ← Regresar
        </Button>
        <h2 className="form-title mb-4">NUEVA SUCURSAL</h2>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nombre comercial</Form.Label>
            <Form.Control
              type="text"
              placeholder="Ingresa el nombre comercial"
              value={nombreComercial}
              onChange={(e) => setNombreComercial(e.target.value)}
              isInvalid={emptyFields.includes('Nombre comercial')}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Dirección</Form.Label>
            <Autocomplete
              className={`form-control ${emptyFields.includes('Dirección') ? 'is-invalid' : ''}`}
              onPlaceSelected={handlePlaceSelected}
              options={{
                types: ['address'],
                componentRestrictions: { country: 'mx' },
              }}
              defaultValue={direccion}
              placeholder="Ingresa la dirección"
              onChange={(e) => { setDireccion(e.target.value); }}
            />
          </Form.Group>

          <Row>
            <Form.Group as={Col} sm="6" className="mb-3">
              <Form.Label>Hora de apertura</Form.Label>
              <Form.Control
                type="time"
                value={horaApertura}
                onChange={(e) => setHoraApertura(e.target.value)}
                isInvalid={emptyFields.includes('Horario')}
              />
            </Form.Group>

            <Form.Group as={Col} sm="6" className="mb-3">
              <Form.Label>Hora de cierre</Form.Label>
              <Form.Control
                type="time"
                value={horaCierre}
                onChange={(e) => setHoraCierre(e.target.value)}
                isInvalid={emptyFields.includes('Horario')}
              />
            </Form.Group>
          </Row>

          {showWarning && <div className="warning-text mb-3">Rellene los datos</div>}
          {showErrorAPI && <div className="warning-text mb-3">{errorAPI}</div>} 
          <Button variant="warning" type="submit" className="w-100">
            Registrar
          </Button>
          {responseMessage && <div className="response-message">{responseMessage}</div>} 
        </Form>
      </div>
    </Container>
  );
}

export default App;
