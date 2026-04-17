import React, { useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

function LiveTracking() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState({
    lat: 18.5204,
    lng: 73.8567,
  });

  // Convert location name → coordinates using Google Geocoding API
  const getCoordinates = async (place) => {
  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place + " Pune")}&key=AIzaSyDBC0U9-NZCSxXoLvdeVfDpUERuIz560HE
`
    );

    const data = await res.json();

    console.log("Geocode Response:", data); // DEBUG

    if (data.status === "OK") {
      return data.results[0].geometry.location;
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error fetching location:", error);
    return null;
  }
};
 const handleSearch = async () => {
  if (!source || !destination) {
    alert("Enter source and destination");
    return;
  }

  const sourceCoords = await getCoordinates(source);
  const destCoords = await getCoordinates(destination);

  // ✅ Fallback instead of breaking
  const finalSource = sourceCoords || { lat: 18.5204, lng: 73.8567 };
  const finalDest = destCoords || { lat: 18.5314, lng: 73.8446 };

  if (!sourceCoords || !destCoords) {
    alert("Some locations not found, showing default Pune route");
  }

  const midPoint = {
    lat: (finalSource.lat + finalDest.lat) / 2,
    lng: (finalSource.lng + finalDest.lng) / 2,
  };

  setCenter(midPoint);

  setMarkers([
    finalSource,
    midPoint,
    finalDest,
  ]);
};

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ textAlign: "center" }}>🚌 Live Bus Tracking</h2>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter Source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          style={{ margin: "5px", padding: "8px" }}
        />

        <input
          type="text"
          placeholder="Enter Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          style={{ margin: "5px", padding: "8px" }}
        />

        <button onClick={handleSearch}>Search</button>
      </div>

      <LoadScript googleMapsApiKey="AIzaSyDBC0U9-NZCSxXoLvdeVfDpUERuIz560HE">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={13}
        >
          {markers.map((pos, index) => (
            <Marker key={index} position={pos} />
          ))}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default LiveTracking;