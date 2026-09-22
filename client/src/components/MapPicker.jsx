import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Navigation } from 'lucide-react';

// Custom Pin Icon using HTML/SVG to avoid missing Leaflet marker PNG bundle errors
const createCustomPin = (isLost = true) => {
  return L.divIcon({
    className: 'custom-map-marker',
    html: `
      <div style="
        background: ${isLost ? '#ef4444' : '#10b981'};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: #ffffff;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapRecenter({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position && position[0] && position[1]) {
      map.setView(position, 18);
    }
  }, [position, map]);
  return null;
}

// Exact OpenStreetMap coordinates for ICCT Colleges (Main Campus), V.V. Soliven Ave II, Cainta
const ICCT_CAINTA_COORDS = [14.61778, 121.10257];

const MapPicker = ({ latitude, longitude, onLocationSelect, type = 'LOST' }) => {
  const currentPos = latitude && longitude ? [latitude, longitude] : ICCT_CAINTA_COORDS;

  const handlePreset = (lat, lng, name) => {
    onLocationSelect(lat, lng, name);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span className="flex items-center gap-1 font-medium text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-sky-600" />
          Click anywhere on the campus map to pinpoint exact location:
        </span>
        {latitude && longitude && (
          <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
            {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </span>
        )}
      </div>

      <div className="h-64 sm:h-72 w-full rounded-xl overflow-hidden border border-slate-300 relative shadow-inner">
        <MapContainer
          center={currentPos}
          zoom={18}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <MapRecenter position={currentPos} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onLocationSelect={onLocationSelect} />
          {latitude && longitude && (
            <Marker position={[latitude, longitude]} icon={createCustomPin(type === 'LOST')} />
          )}
        </MapContainer>
      </div>

      {/* Campus Quick Presets */}
      <div className="flex items-center gap-1.5 flex-wrap pt-1">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mr-1">Quick Campus Spots:</span>
        <button
          type="button"
          onClick={() => handlePreset(14.61765, 121.10245, 'ICCT Main Gate / Security Post')}
          className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
        >
          Main Gate
        </button>
        <button
          type="button"
          onClick={() => handlePreset(14.61778, 121.10257, 'Main Building (Floors 1-6)')}
          className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
        >
          Main Building
        </button>
        <button
          type="button"
          onClick={() => handlePreset(14.61790, 121.10250, 'Campus Canteen (Ground Floor)')}
          className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
        >
          Canteen
        </button>
        <button
          type="button"
          onClick={() => handlePreset(14.61782, 121.10268, 'College Library (3rd Floor)')}
          className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
        >
          Library (3rd Flr)
        </button>
        <button
          type="button"
          onClick={() => handlePreset(14.61772, 121.10264, 'Computer Laboratories (4th Floor)')}
          className="text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 px-2.5 py-1 rounded-md border border-slate-200 transition-colors"
        >
          Computer Labs
        </button>
      </div>
    </div>
  );
};

export default MapPicker;
