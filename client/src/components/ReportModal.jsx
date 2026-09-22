import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import MapPicker from './MapPicker';
import { X, UploadCloud, AlertCircle, CheckCircle2, Image as ImageIcon, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
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
  const [latitude, setLatitude] = useState(14.61778);
  const [longitude, setLongitude] = useState(121.10257);
  const [dateIncident, setDateIncident] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [contactInfo, setContactInfo] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [externalUrls, setExternalUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [photoMode, setPhotoMode] = useState('file'); // 'file' | 'url'

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
    const combinedFiles = [...files, ...selectedFiles];
    if (combinedFiles.length + externalUrls.length > 5) {
      setError('You can attach a maximum of 5 images total.');
      return;
    }
    setFiles(combinedFiles);

    const prevs = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...prevs]);
    setError('');
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('Image URL must start with http:// or https://');
      return;
    }
    if (files.length + externalUrls.length >= 5) {
      setError('You can attach a maximum of 5 images total.');
      return;
    }
    setExternalUrls((prev) => [...prev, trimmed]);
    setUrlInput('');
    setError('');
  };

  const handleRemoveUrl = (index) => {
    setExternalUrls((prev) => prev.filter((_, i) => i !== index));
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

      if (externalUrls.length > 0) {
        formData.append('imageUrls', JSON.stringify(externalUrls));
      }

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
          setExternalUrls([]);
          setUrlInput('');
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

          {/* Photo Upload & URL Section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Item Photos (Max 5)
              </label>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setPhotoMode('file')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photoMode === 'file'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoMode('url')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                    photoMode === 'url'
                      ? 'bg-white text-slate-800 shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>
            </div>

            {photoMode === 'file' ? (
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
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/photo.jpg or direct image link..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUrl}
                    className="px-3 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Direct image links (Unsplash, Imgur, Cloud storage) stay permanently accessible online.
                </p>
              </div>
            )}

            {/* Combined Previews */}
            {(previews.length > 0 || externalUrls.length > 0) && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto py-1">
                {previews.map((src, i) => (
                  <div
                    key={`file-${i}`}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 group shadow-xs"
                  >
                    <img src={src} alt="Preview" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[9px] px-1 rounded">
                      File
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs"
                      title="Remove file"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}

                {externalUrls.map((url, i) => (
                  <div
                    key={`url-${i}`}
                    className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0 bg-slate-100 group shadow-xs"
                  >
                    <img
                      src={url}
                      alt="URL preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                    <span className="absolute bottom-1 left-1 bg-sky-900/80 text-white text-[9px] px-1 rounded">
                      URL
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(i)}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors shadow-xs"
                      title="Remove URL"
                    >
                      <X className="w-3 h-3" />
                    </button>
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
