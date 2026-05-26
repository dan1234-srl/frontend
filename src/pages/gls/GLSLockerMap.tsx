import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
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

const GLSLockerMap = ({
  deliveryPoints,
  selectedLocker, // Folosit dacă vrei să randezi un marker diferit pentru cel selectat în viitor
  setSelectedLocker,
}: any) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-100 shadow-xl h-[450px]">
      <MapContainer
        center={[45.9432, 24.9668]} // Centrat pe România
        zoom={7}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {(deliveryPoints || []).map((point: any) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            eventHandlers={{
              // Selecția se face automat când utilizatorul dă click pe marker!
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
