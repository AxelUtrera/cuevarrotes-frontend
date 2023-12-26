const toRadians = (degrees) => {
    return degrees * (Math.PI / 180);
  };
  
  // Función para calcular la distancia en kilómetros usando la fórmula de Haversine
  const haversineDistance = (coord1, coord2) => {
    const R = 6371; // Radio de la Tierra en kilómetros
  
    const lat1 = toRadians(coord1.lat);
    const lon1 = toRadians(coord1.lng);
    const lat2 = toRadians(coord2.lat);
    const lon2 = toRadians(coord2.lng);
  
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
  
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distance = R * c; // Distancia en kilómetros
  
    return distance;
  };


  export { haversineDistance }