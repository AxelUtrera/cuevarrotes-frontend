
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

export { createCustomer, isCustomerRegistered}