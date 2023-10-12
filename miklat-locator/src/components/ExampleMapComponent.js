// src/components/ExampleMapComponent.js
import React, { useState, useEffect, useRef } from 'react';

function ExampleMapComponent() {
  const [locations, setLocations] = useState([]);
  const initialCenter = {
    lat: 31.76077913556808,
    lng: 35.17384751925708
  };
  const mapRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.margin = '0';

    fetch('/api/locations')
    .then(response => {
        console.log(response);
        return response.json();
    })
    .then(data => {
        console.log(data);
        const updatedLocations = [{name: 'Initial Center', location: initialCenter}, ...data];
        setLocations(updatedLocations);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAh_nkW37RFDN4SC3FPAUx4mJAUgNb8pW8&callback=initMap`;
    script.async = true;
    window.initMap = initMap;
    document.head.appendChild(script);

    function initMap() {
      const map = new window.google.maps.Map(document.getElementById('map'), {
        center: initialCenter,
        zoom: 6,
      });
      mapRef.current = map;
      addMarkers(map, locations);

      function addUserLocationMarker(position) {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        new window.google.maps.Marker({
          position: pos,
          map,
          title: 'Current Location',
          icon: {
            url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
          },
        });
        map.setCenter(pos);
        map.setZoom(15);
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          addUserLocationMarker,
          () => {
            handleLocationError(true, map.getCenter(), map);
          }
        );
      } else {
        handleLocationError(false, map.getCenter(), map);
      }

      const locationButton = document.createElement('button');
      locationButton.textContent = 'Pan to Current Location';
      locationButton.classList.add('custom-map-control-button');
      map.controls[window.google.maps.ControlPosition.TOP_CENTER].push(locationButton);

      locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            addUserLocationMarker,
            () => {
              handleLocationError(true, map.getCenter(), map);
            }
          );
        } else {
          handleLocationError(false, map.getCenter(), map);
        }
      });
    }

    function handleLocationError(browserHasGeolocation, pos, map) {
      const infoWindow = new window.google.maps.InfoWindow();
      infoWindow.setPosition(pos);
      infoWindow.setContent(
        browserHasGeolocation
          ? 'Error: The Geolocation service failed.'
          : "Error: Your browser doesn't support geolocation."
      );
      infoWindow.open(map);
    }

    return () => {
      document.head.removeChild(script);
      window.initMap = undefined;
    };
  }, []);

  function verifyLocations(locations) {
    const errors = [];
    locations.forEach((location, index) => {
      if (!location.name) {
        errors.push(`Location at index ${index} missing 'name' property`);
      }
      if (!location.location || typeof location.location.lat !== 'number' || typeof location.location.lng !== 'number') {
        errors.push(`Location at index ${index} has invalid or missing 'location' property`);
      }
    });
    return errors;
  }

  function addMarkers(map, locations) {
    const verificationErrors = verifyLocations(locations);
    if (verificationErrors.length > 0) {
        console.error('Location data verification failed:', verificationErrors);
        return;
      }
    if (mapRef.current.markers) {
      mapRef.current.markers.forEach(marker => marker.setMap(null));
    }

    mapRef.current.markers = locations.map(location => {
      const marker = new window.google.maps.Marker({
        position: location.location,
        map,
        title: location.name,
      });
      return marker;
    });
  }

  useEffect(() => {
    if (mapRef.current) {
      addMarkers(mapRef.current, locations);
    }
  }, [locations.]);

  return (
    <div id="map" style={{ width: '600px', height: '600px' }}></div>
  );
}

export default ExampleMapComponent;
