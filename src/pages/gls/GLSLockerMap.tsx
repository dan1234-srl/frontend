import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix pentru iconițele lipsă din react-leaflet
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// Componenta de asistență pentru zoom automat
function MapAutoZoom({ points, selectedLocker }) {
  const map = useMap();

  useEffect(() => {
    // Dacă ai un locker selectat, dă zoom direct pe el
    if (selectedLocker && selectedLocker.lat && selectedLocker.lng) {
      map.setView([selectedLocker.lat, selectedLocker.lng], 16, {
        animate: true,
      });
      return;
    }

    // Altfel, încadrează toate punctele filtrate
    if (points && points.length > 0) {
      const validPoints = points.filter((p) => p.lat && p.lng);
      if (validPoints.length > 0) {
        const bounds = L.latLngBounds(validPoints.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds, {
          padding: [40, 40],
          maxZoom: 15,
          animate: true,
        });
      }
    }
  }, [points, selectedLocker, map]);

  return null;
}

const GLSLockerMap = ({
  deliveryPoints,
  selectedLocker,
  setSelectedLocker,
}: any) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 shadow-xl h-[450px]">
      <MapContainer
        center={[45.9432, 24.9668]}
        zoom={7}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {/* Adăugăm componenta care gestionează zoom-ul automat */}
        <MapAutoZoom points={deliveryPoints} selectedLocker={selectedLocker} />

        {(deliveryPoints || []).map((point: any) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            eventHandlers={{
              click: () => setSelectedLocker(point),
            }}
          >
            <Popup>
              <div className="p-2 space-y-2">
                <p className="font-black text-[10px] uppercase text-zinc-800">
                  {point.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {point.street} {point.house_number}, {point.city}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default GLSLockerMap;
