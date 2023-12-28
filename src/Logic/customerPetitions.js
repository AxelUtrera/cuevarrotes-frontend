
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

export { createCustomer, isCustomerRegistered, getPhoneNumber}