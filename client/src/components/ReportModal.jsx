import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MapPicker from './MapPicker';
import { X, UploadCloud, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportModal = ({ isOpen, onClose, onItemCreated }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('LOST');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationName, setLocationName] = useState('ICCT Main Building');
  const [latitude, setLatitude] = useState(14.5802);
  const [longitude, setLongitude] = useState(121.1218);
  const [dateIncident, setDateIncident] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [contactInfo, setContactInfo] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getCategories().then((res) => {
        if (res.success && res.categories.length > 0) {
          setCategories(res.categories);
          if (!categoryId) setCategoryId(res.categories[0].id);
        }
      });
    }
  }, [isOpen]);

  const handleLocationSelect = (lat, lng, name) => {
    setLatitude(lat);
    setLongitude(lng);
    if (name) {
      setLocationName(name);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 5) {
      setError('You can upload a maximum of 5 images.');
      return;
    }
    setFiles(selectedFiles);

    const prevs = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(prevs);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit a report. Redirecting to login...');
      setTimeout(() => {
        onClose();
        navigate('/login');
      }, 1500);
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('locationName', locationName);
      formData.append('dateIncident', dateIncident);
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (contactInfo) formData.append('contactInfo', contactInfo);

      files.forEach((file) => {
        formData.append('images', file);
      });

      const res = await api.createItem(formData);
      if (res.success) {
        setSuccess('Item report submitted successfully!');
        if (onItemCreated) onItemCreated(res.item);
        setTimeout(() => {
          onClose();
          // Reset form
          setTitle('');
          setDescription('');
          setFiles([]);
          setPreviews([]);
          setSuccess('');
        }, 1200);
      } else {
        setError(res.message || 'Failed to submit item report.');
      }
    } catch (err) {
      setError('An unexpected error occurred while submitting.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Post Item Report</h3>
            <p className="text-xs text-slate-500">Record a lost or found item for ICCT Cainta campus</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Type Toggle: LOST vs FOUND */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Report Category Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setType('LOST')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  type === 'LOST'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                <span>I Lost An Item (Missing)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('FOUND')}
                className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  type === 'FOUND'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                <span>I Found An Item (Surrendered)</span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Blue AquaFlask Tumbler or BSIT Student ID"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Date Lost or Found *
              </label>
              <input
                type="date"
                required
                value={dateIncident}
                onChange={(e) => setDateIncident(e.target.value)}
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
              </input>
            </div>
          </div>

          {/* Location Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus Location Details *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Main Canteen 1st floor near milk tea stall"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Map Pinpoint */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Campus Map Pinpoint (Optional)
            </label>
            <p className="text-[11px] text-slate-500 mb-2">
              Mark the exact location where the item was lost or found on the ICCT Cainta map.
            </p>
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationSelect={handleLocationSelect}
              type={type}
            />
          </div>

          {/* Photo Upload Dropzone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Upload Item Photos
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-sky-400 rounded-2xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 mx-auto text-sky-600 mb-2" />
              <p className="text-xs font-medium text-slate-700">
                Click or drag images here to upload
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP (Max 5MB each)</p>
            </div>

            {previews.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto py-1">
                {previews.map((src, i) => (
                  <div key={i} className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Description & Distinguishing Features *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe color, size, brands, stickers, contents, or security details..."
              className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Contact Information */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Contact / Surrender Instructions
            </label>
            <input
              type="text"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. Leave with guard at Main Gate or message 0918xxxxxxx"
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>

          {/* Submit button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm shadow-md shadow-sky-900/10 transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Report...' : 'Publish Item Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
