import React, { useEffect, useState } from 'react';
import { haversineDistance } from '../Logic/haversine';



const MapComponent = () => {
    const [currentLocation, setCurrentLocation] = useState({ lat: null, lng: null });
    const [branches, setBranches] = useState([]);
    const [closestBranch, setClosestBranch] = useState(null);
    const [distance, setDistance] = useState(null);

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
    
            setBranches(data.response)
        } catch (error) {
            console.error('Error en la solicitud:', error);
        }
    }


    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(function (position) {
                setCurrentLocation({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
            });
        } else {
            console.log("Geolocation is not available in your browser.");
        }


        getBranchesInfo()
    }, []);


    useEffect(() => {
        if (currentLocation && branches.length > 0) {
          let closestBranch = null;
          let minDistance = Infinity;
    
          branches.forEach((branch) => {
            const branchCoords = { lat: branch.ubicacion.latitud, lng: branch.ubicacion.longitud };
            const calculatedDistance = haversineDistance(currentLocation, branchCoords);
            
            
            if (calculatedDistance < minDistance) {
              minDistance = calculatedDistance;
              closestBranch = branch;
            }
          });
    
          setClosestBranch(closestBranch);
          setDistance(minDistance);
        }
      }, [currentLocation, branches]);
    

    return (
        <div>
            <h2>My Current Location</h2>
            Distance {distance} km
        </div>
    );
}

export default MapComponent;
