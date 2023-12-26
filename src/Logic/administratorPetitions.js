const createBranch = async (branchData) => {
    const token = localStorage.getItem('token'); // Recuperar el token del localStorage
    const url = 'http://localhost:6969/api/v1/administrator/createBranch';
  
    const requestBody = {
      ...branchData
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Usar el token para la autorización
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const responseData = await response.json();
      console.log('Sucursal creada con éxito:', responseData);
      // Aquí puedes manejar la respuesta, como actualizar el estado o redireccionar al usuario
    } catch (error) {
      console.error('Error al crear la sucursal:', error);
      // Aquí manejarías los errores, como mostrar un mensaje al usuario
    }
  };
  
  export { createBranch }