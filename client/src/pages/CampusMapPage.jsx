import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import DirectoryMap from '../components/DirectoryMap';
import ItemDetailModal from '../components/ItemDetailModal';
import { MapPin, Navigation, Tag, Search, Filter } from 'lucide-react';

const CampusMapPage = ({ onOpenReportModal }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [activeItem, setActiveItem] = useState(null);

  useEffect(() => {
    api.getItems().then((res) => {
      if (res.success) setItems(res.items);
      setLoading(false);
    });
  }, []);

  const filteredItems = items.filter((item) => {
    if (filterType === 'ALL') return true;
    return item.type === filterType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-600" />
            <span>Interactive Campus Directory Map</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore reports geolocated across ICCT Colleges Cainta Campus (Academic Buildings, Canteen, Library & Gates)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'LOST', 'FOUND'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterType === t
                  ? t === 'LOST'
                    ? 'bg-rose-600 text-white'
                    : t === 'FOUND'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {t === 'ALL' ? 'All Pins' : t === 'LOST' ? '🔴 Lost Only' : '🟢 Found Only'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map with responsive height */}
      <div className="w-full">
        <DirectoryMap
          items={filteredItems}
          height="620px"
          onItemClick={(item) => setActiveItem(item)}
        />
      </div>

      {/* Quick Location Points Guide */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Navigation className="w-4 h-4 text-sky-600" />
          <span>Campus Key Locations & Lost Item Handling Guide</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1">Main Gate Security</h4>
            <p className="leading-relaxed">All surrendered high-value belongings (wallets, phones, keys) are deposited here for verification.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1">College Library (3rd Floor)</h4>
            <p className="leading-relaxed">Stationery, notebooks, and student cards found in study bays are kept at the library circulation desk.</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
            <h4 className="font-bold text-slate-800 mb-1">Computer Laboratories</h4>
            <p className="leading-relaxed">Mice, flash drives, and peripherals left during classes can be inquired from lab custodians.</p>
          </div>
        </div>
      </div>

      {activeItem && (
        <ItemDetailModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onItemUpdated={(updated) => {
            if (updated) {
              setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
            }
          }}
        />
      )}
    </div>
  );
};

export default CampusMapPage;
