const createBranch = async (branchData) => {
    const token = localStorage.getItem('token');
    const url = 'http://localhost:6969/api/v1/administrator/createBranch';
  
    const requestBody = {
      ...branchData
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(requestBody)
      });
  
      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.message);
      }
  
      const responseData = await response.json();
      console.log('Sucursal creada con éxito:', responseData);
      
    } catch (error) {
      
      throw new Error(`${error.message}`);
    }
  };
  
  export { createBranch }