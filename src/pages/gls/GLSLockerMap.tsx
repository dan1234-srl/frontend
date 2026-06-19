/**
 * GLSLockerMap.tsx
 * Design Premium - Integrat în flow-ul Checkout
 */

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// Fix iconițe Leaflet implicite
const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

function MapAutoZoom({ points, selectedLocker }: any) {
  const map = useMap();

  useEffect(() => {
    // Timeout scurt pentru a lăsa containerul să se randeze corect înainte de zoom (fix pt animații)
    const t = setTimeout(() => {
      if (selectedLocker && selectedLocker.lat && selectedLocker.lng) {
        map.setView([selectedLocker.lat, selectedLocker.lng], 16, {
          animate: true,
        });
        return;
      }

      if (points && points.length > 0) {
        const validPoints = points.filter((p: any) => p.lat && p.lng);
        if (validPoints.length > 0) {
          const bounds = L.latLngBounds(
            validPoints.map((p: any) => [p.lat, p.lng]),
          );
          map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15,
            animate: true,
          });
        }
      }
    }, 100);
    return () => clearTimeout(t);
  }, [points, selectedLocker, map]);

  return null;
}

const GLSLockerMap = ({
  deliveryPoints,
  selectedLocker,
  setSelectedLocker,
}: any) => {
  return (
    <div
      className="w-full h-full bg-zinc-100 z-10"
      style={{ isolation: "isolate" }}
    >
      <MapContainer
        center={[45.9432, 24.9668]}
        zoom={7}
        className="h-full w-full"
        zoomControl={false} // Ascundem controlul implicit și-l putem repune stilizat dacă vrem
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" // Folosim o temă modernă, curată (Voyager)
        />

        <MapAutoZoom points={deliveryPoints} selectedLocker={selectedLocker} />

        {(deliveryPoints || []).map((point: any) => (
          <Marker
            key={point.id}
            position={[point.lat, point.lng]}
            eventHandlers={{
              click: () => setSelectedLocker(point),
            }}
          >
            <Popup className="premium-leaflet-popup">
              <div className="p-1 space-y-1.5 min-w-[180px]">
                <p className="font-black text-[10px] uppercase tracking-widest text-[var(--royal-violet)] border-b border-zinc-100 pb-1.5 mb-1.5">
                  {point.name}
                </p>
                <p className="text-[11px] font-bold text-zinc-800 leading-tight">
                  {point.street} {point.house_number}
                </p>
                <p className="text-[10px] text-zinc-500 font-medium">
                  {point.city}, {point.zip || point.postal_code || ""}
                </p>
                <button
                  onClick={() => setSelectedLocker(point)}
                  className="mt-3 w-full py-2 bg-[var(--royal-violet)] text-white text-[9px] font-black uppercase tracking-widest rounded-lg shadow-sm hover:brightness-110 transition-all"
                >
                  Selectează
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Stiluri injectate pentru a suprascrie aspectul default urât din Leaflet */}
      <style>{`
        .leaflet-container { font-family: inherit; }
        .premium-leaflet-popup .leaflet-popup-content-wrapper {
            border-radius: 16px;
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05);
            padding: 12px;
        }
        .premium-leaflet-popup .leaflet-popup-tip {
            box-shadow: 0 10px 40px -10px rgba(0,0,0,0.15);
        }
        .premium-leaflet-popup .leaflet-popup-close-button {
            top: 12px;
            right: 12px;
            color: #a1a1aa;
        }
        .premium-leaflet-popup .leaflet-popup-close-button:hover {
            color: #f43f5e;
            background: transparent;
        }
      `}</style>
    </div>
  );
};

export default GLSLockerMap;
