import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ItemCard from '../components/ItemCard';
import DirectoryMap from '../components/DirectoryMap';
import ItemDetailModal from '../components/ItemDetailModal';
import {
  Search,
  Filter,
  MapPin,
  PlusCircle,
  LayoutGrid,
  Map as MapIcon,
  HelpCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

const Home = ({ onOpenReportModal }) => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState('ALL'); // ALL, LOST, FOUND
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'map'

  // Modals
  const [activeItem, setActiveItem] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedType !== 'ALL') params.type = selectedType;
      if (selectedCategory) params.categoryId = selectedCategory;
      if (selectedStatus !== 'ALL') params.status = selectedStatus;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await api.getItems(params);
      if (res.success) {
        setItems(res.items);
      }
    } catch (e) {
      console.error('Error fetching items:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCategories().then((res) => {
      if (res.success) setCategories(res.categories);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchItems();
    }, 250);
    return () => clearTimeout(timer);
  }, [selectedType, selectedCategory, selectedStatus, searchQuery]);

  const handleItemUpdated = (updatedItem, deletedId) => {
    if (deletedId) {
      setItems((prev) => prev.filter((i) => i.id !== deletedId));
      setActiveItem(null);
    } else if (updatedItem) {
      setItems((prev) =>
        prev.map((i) => (i.id === updatedItem.id ? { ...i, ...updatedItem } : i))
      );
      setActiveItem((prev) => (prev ? { ...prev, ...updatedItem } : null));
    }
  };

  const totalLostCount = items.filter((i) => i.type === 'LOST').length;
  const totalFoundCount = items.filter((i) => i.type === 'FOUND').length;
  const activeCount = items.filter((i) => i.status === 'ACTIVE').length;

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-900 via-sky-800 to-indigo-950 text-white shadow-xl px-6 py-12 sm:px-12 sm:py-16">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-sky-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Official ICCT Colleges Cainta Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Lost Something on Campus? We're Here to Help.
          </h1>
          <p className="text-sky-100 text-sm sm:text-base leading-relaxed">
            Report missing belongings, browse items surrendered to the campus security post, and locate reported spots directly on the campus map.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onOpenReportModal}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item Now</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-sm transition-all"
            >
              <MapIcon className="w-4 h-4 text-sky-300" />
              <span>Explore Campus Map</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-24 bottom-0 -mb-12 w-64 h-64 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Quick Summary Counter Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{items.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Listings</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{totalLostCount}</div>
            <div className="text-xs text-slate-500 font-medium">Lost Items</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{totalFoundCount}</div>
            <div className="text-xs text-slate-500 font-medium">Found Items</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xl font-extrabold text-slate-900">{activeCount}</div>
            <div className="text-xs text-slate-500 font-medium">Active Inquiries</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        {/* Search input and View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by item name, details, or campus location (e.g. Canteen, ID, Mouse)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid View</span>
            </button>
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Campus Map</span>
            </button>
          </div>
        </div>

        {/* Type and Category Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
          {/* Type tabs */}
          <div className="flex items-center gap-2">
            {['ALL', 'LOST', 'FOUND'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedType === type
                    ? type === 'LOST'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : type === 'FOUND'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Items' : type === 'LOST' ? '🔴 Lost Items' : '🟢 Found Items'}
              </button>
            ))}
          </div>

          {/* Select Dropdowns */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="CLAIMED">Claim In Progress</option>
              <option value="RETURNED">Returned</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'map' ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Campus Map View (ICCT Cainta)</span>
            </h3>
            <span className="text-xs text-slate-500">
              Showing locations of all tagged reports
            </span>
          </div>
          <DirectoryMap items={items} onItemClick={(item) => setActiveItem(item)} />
        </div>
      ) : (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 h-80 animate-pulse p-4">
                  <div className="bg-slate-200 h-44 rounded-xl mb-3"></div>
                  <div className="bg-slate-200 h-4 rounded w-3/4 mb-2"></div>
                  <div className="bg-slate-200 h-3 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Search className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-lg">No matching reports found</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Try adjusting your search keywords, category filters, or report a new item.
                </p>
              </div>
              <button
                onClick={onOpenReportModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-700 text-white rounded-xl text-xs font-semibold hover:bg-sky-800 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Post New Report</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onClick={() => setActiveItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Item Details Modal */}
      {activeItem && (
        <ItemDetailModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onItemUpdated={handleItemUpdated}
        />
      )}
    </div>
  );
};

export default Home;
