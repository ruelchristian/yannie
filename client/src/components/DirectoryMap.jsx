import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';

const createMapPin = (type = 'LOST', status = 'ACTIVE') => {
  const isResolved = ['RETURNED', 'CLOSED'].includes(status);
  let color = type === 'LOST' ? '#ef4444' : '#10b981';
  if (isResolved) color = '#64748b';

  return L.divIcon({
    className: 'custom-directory-pin',
    html: `
      <div style="
        background: ${color};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 10px rgba(0,0,0,0.35);
      ">
        <span style="
          transform: rotate(45deg);
          color: #ffffff;
          font-weight: 800;
          font-size: 11px;
          font-family: sans-serif;
        ">
          ${type === 'LOST' ? 'L' : 'F'}
        </span>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
};

const ICCT_CAINTA_CENTER = [14.5802, 121.1218];

const DirectoryMap = ({ items = [], onItemClick, height = "520px" }) => {
  // Filter items that have valid latitude & longitude
  const mappedItems = items.filter(
    (item) => item.latitude && item.longitude && !isNaN(item.latitude) && !isNaN(item.longitude)
  );

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-white">
      {/* Legend banner */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
          <span>Lost ({mappedItems.filter(i => i.type === 'LOST').length})</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium text-slate-700">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
          <span>Found ({mappedItems.filter(i => i.type === 'FOUND').length})</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span>
          <span>Resolved</span>
        </div>
      </div>

      <div style={{ height }}>
        <MapContainer
          center={ICCT_CAINTA_CENTER}
          zoom={17}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {mappedItems.map((item) => {
            const hasImage = item.images && item.images.length > 0;
            const imgUrl = hasImage ? item.images[0].imageUrl : null;

            return (
              <Marker
                key={item.id}
                position={[item.latitude, item.longitude]}
                icon={createMapPin(item.type, item.status)}
              >
                <Popup className="custom-popup">
                  <div className="w-56 p-1 text-slate-800">
                    {imgUrl && (
                      <div className="h-28 w-full rounded-lg overflow-hidden mb-2 bg-slate-100">
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          item.type === 'LOST'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.type}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {item.category?.name || 'General'}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-900 line-clamp-1 mb-1">
                      {item.title}
                    </h5>

                    <div className="flex items-start gap-1 text-[11px] text-slate-600 mb-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{item.locationName}</span>
                    </div>

                    <button
                      onClick={() => onItemClick && onItemClick(item)}
                      className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>View Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default DirectoryMap;
