'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png',
});

function MapCenterUpdater({ setMapCenter }) {
  const map = useMap();
  // ... rest of your MapCenterUpdater code ...
  return null;
}

export default function MapComponent({ mapCenter, setMapCenter, nearbyProviders }) {
  return (
    <MapContainer
      center={mapCenter}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapCenterUpdater setMapCenter={setMapCenter} />
      {nearbyProviders.map((provider) => (
        <Marker key={provider.id} position={provider.position}>
          <Popup>
            <strong>{provider.name}</strong>
            <br />
            Service: {provider.service}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
