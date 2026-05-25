import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const GLSLockerMap = ({
  deliveryPoints,
  selectedLocker,
  setSelectedLocker,
}: any) => {
  return (
    <MapContainer
      center={[45.9432, 24.9668]}
      zoom={7}
      className="h-[450px] w-full rounded-2xl z-0"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {deliveryPoints.map((point: any) => (
        <Marker
          key={point.id}
          position={[point.latitude, point.longitude]}
          eventHandlers={{
            click: () => setSelectedLocker(point),
          }}
        >
          <Popup>
            <div className="space-y-2">
              <p className="font-bold">{point.name}</p>

              <p>
                {point.street} {point.house_number}
              </p>

              <p>{point.city}</p>

              <button onClick={() => setSelectedLocker(point)}>
                Selectează
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default GLSLockerMap;
