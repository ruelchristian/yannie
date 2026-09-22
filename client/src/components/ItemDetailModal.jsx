import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getImageUrl } from '../services/api';
import {
  X,
  MapPin,
  Calendar,
  User,
  Phone,
  Mail,
  Shield,
  Clock,
  CheckCircle2,
  Trash2,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const createStaticPin = (isLost = true) => {
  return L.divIcon({
    className: 'custom-static-pin',
    html: `
      <div style="
        background: ${isLost ? '#ef4444' : '#10b981'};
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });
};

const ItemDetailModal = ({ item, onClose, onItemUpdated }) => {
  const { user, isAdmin } = useAuth();
  const [claimText, setClaimText] = useState('');
  const [claimPhone, setClaimPhone] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState('');
  const [claimError, setClaimError] = useState('');

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(item.status);

  if (!item) return null;

  const isOwner = user && user.id === item.userId;
  const canManage = isOwner || isAdmin;
  const isLost = item.type === 'LOST';

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await api.updateItemStatus(item.id, newStatus);
      if (res.success) {
        setSelectedStatus(newStatus);
        if (onItemUpdated) onItemUpdated(res.item);
      }
    } catch (e) {
      alert('Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;
    try {
      const res = await api.deleteItem(item.id);
      if (res.success) {
        if (onItemUpdated) onItemUpdated(null, item.id);
        onClose();
      }
    } catch (e) {
      alert('Failed to delete item');
    }
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setClaimError('Please log in first to submit a claim or inquiry.');
      return;
    }
    setSubmittingClaim(true);
    setClaimError('');
    setClaimSuccess('');
    try {
      const res = await api.submitClaim(item.id, {
        proofDetails: claimText,
        contactNumber: claimPhone,
      });
      if (res.success) {
        setClaimSuccess(res.message || 'Claim submitted successfully!');
        setClaimText('');
        setClaimPhone('');
      } else {
        setClaimError(res.message || 'Failed to submit claim.');
      }
    } catch (e) {
      setClaimError('Network error while submitting claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  const formattedDate = new Date(item.dateIncident || item.createdAt).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                isLost ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {item.type} Item
            </span>
            <span className="text-xs font-semibold text-sky-800 bg-sky-100/70 px-2.5 py-1 rounded-full">
              {item.category?.name}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Report #{item.id}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Main Title & Photos */}
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
              {item.title}
            </h2>

            {item.images && item.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {item.images.map((img, idx) => (
                  <div key={idx} className="h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <img
                      src={getImageUrl(img.imageUrl)}
                      alt={`${item.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-xs border border-dashed border-slate-300 mb-4">
                No photos attached to this report
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description & Identifying Marks</h4>
            <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>

          {/* Meta Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location & Date</h4>
              <div className="flex items-start gap-2 text-slate-700">
                <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{item.locationName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Date: {formattedDate}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
              <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reported By</h4>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <User className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{item.user?.fullName || 'Campus Community Member'}</span>
                {item.user?.role && (
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono uppercase">
                    {item.user.role}
                  </span>
                )}
              </div>
              {item.contactInfo && (
                <div className="flex items-start gap-2 text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Contact instructions: <strong className="text-slate-800">{item.contactInfo}</strong></span>
                </div>
              )}
            </div>
          </div>

          {/* Map Preview if coordinates present */}
          {item.latitude && item.longitude && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-sky-600" />
                Pinpointed Campus Location
              </h4>
              <div className="h-48 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                <MapContainer
                  center={[item.latitude, item.longitude]}
                  zoom={18}
                  scrollWheelZoom={false}
                  className="h-full w-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker
                    position={[item.latitude, item.longitude]}
                    icon={createStaticPin(isLost)}
                  />
                </MapContainer>
              </div>
            </div>
          )}

          {/* Owner / Admin Status Controls */}
          {canManage && (
            <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-sky-900 block">Manage Report Status</span>
                <span className="text-xs text-sky-700">Update status as item moves through recovery:</span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {['ACTIVE', 'CLAIMED', 'RETURNED', 'CLOSED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingStatus || selectedStatus === st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedStatus === st
                        ? 'bg-sky-700 text-white shadow-sm'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-sky-100/50'
                    }`}
                  >
                    {st}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleDelete}
                  className="p-2 text-rose-600 hover:bg-rose-100/80 rounded-xl transition-colors ml-2"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Claim / Inquiry Section (if not owner) */}
          {!isOwner && item.status === 'ACTIVE' && (
            <div className="p-5 bg-gradient-to-br from-slate-50 to-sky-50/30 rounded-2xl border border-slate-200">
              <h4 className="font-bold text-sm text-slate-900 mb-1 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-sky-600" />
                {isLost ? 'Found this item or have information?' : 'Is this your item? Claim it here'}
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Provide verifiable details (e.g. serial numbers, wallpaper, contents, or where you found it) to prove ownership or report a find.
              </p>

              {claimSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{claimSuccess}</span>
                </div>
              )}
              {claimError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{claimError}</span>
                </div>
              )}

              <form onSubmit={handleClaimSubmit} className="space-y-3">
                <textarea
                  rows={3}
                  required
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  placeholder={
                    isLost
                      ? "Describe where you spotted or kept this item, or who to contact..."
                      : "Describe specific distinguishing features not mentioned in the photo (e.g. ID number, phone unlock PIN description, unique scratches)..."
                  }
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={claimPhone}
                    onChange={(e) => setClaimPhone(e.target.value)}
                    placeholder="Your contact number (optional)"
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={submittingClaim}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingClaim ? 'Submitting...' : 'Submit Claim / Inquiry'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ItemDetailModal;
