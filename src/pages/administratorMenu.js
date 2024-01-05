import React from 'react';
import { Container, Navbar, Card, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { AcceptButton } from "../components/componentsUI";
import logo from '../components/img/logo.png'

const AdministratorMenu = () => {
    const navigate = useNavigate()


    const navigateToCreateProduct = () => {
        navigate("/registerProduct")
    }

    const navigateToCreateBranch = () => {
        navigate("/createBranch")
    }

    const navigateToRegisterUser = () => {
        navigate("")
    }

    return (
        <>
            <Navbar className=" nav">
                <Container>
                    <Navbar.Brand href="#home">
                        <img src={logo} width="40" height="40" className="d-inline-block align-top" alt="Cuebarrotes logo" />
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse className="justify-content-end">
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <Container className='mt-4'>
                <AcceptButton buttonText='Crear Producto' onClickMethod={navigateToCreateProduct} />
                <AcceptButton buttonText='Crear Sucursal' onClickMethod={navigateToCreateBranch} />
                <AcceptButton buttonText='Registrar Usuario' onClickMethod={navigateToRegisterUser} />
            </Container>
        </>


    );
}


export { AdministratorMenu }