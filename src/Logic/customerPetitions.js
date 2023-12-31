const createCustomer = async (data) => {
    const registerResponse = await fetch('http://127.0.0.1:9000/api/v1/customer/registerCustomer', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: data
    });

    return registerResponse
}


const isCustomerRegistered = async (numberPhone) => {
    const customerResponse = await fetch(`http://127.0.0.1:9000/api/v1/customer/customerNotRegistered/${numberPhone}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return customerResponse
}

async function getPhoneNumber() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("No se encontró el token en el localStorage.");
        }

        const response = await fetch('http://localhost:6969/api/v1/customer/user/phone', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }

        const data = await response.json();
        return data.phone;
    } catch (error) {
        console.error("Error al obtener el número de teléfono:", error.message);
        return null;
    }
}

const cancelOrder = async (orderId) => {
    try {
        const url = `http://localhost:6969/api/v1/customer/cancelOrder/${orderId}`;
        const response = await fetch(url, {
            method: 'PATCH', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({})
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json(); 
        console.log('Orden cancelada con éxito:', data);
        return data; 
    } catch (error) {
        console.error('Error al cancelar la orden:', error);
        throw error; 
    }
};

const getProductDetails = async (codigoBarras) => {
    const url = `http://localhost:6969/api/v1/customer/products/${codigoBarras}`;
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const productData = await response.json();
        return {
            name: productData.nombre,
            image: productData.imagen || 'URL_de_imagen_por_defecto',
            price: productData.precioUnitario
        };
    } catch (error) {
        console.error('Could not fetch the product:', error);
        return {};
    }
};

export { createCustomer, isCustomerRegistered, getPhoneNumber, cancelOrder, getProductDetails}