// authService.js
const login = async (phoneNumber, password) => {
    const loginData = {
      numTelefono: phoneNumber,
      contrasenia: password
    };
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/v1/auth/login`, {

        method: 'POST', 
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
  
      if (!response.ok) {
        throw new Error('Error en la solicitud de login');
      }
  
      const data = await response.json();
      return data; 
    } catch (error) {
      throw error; 
    }
  };
  
  export default login;
  