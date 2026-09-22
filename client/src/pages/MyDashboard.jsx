import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, getImageUrl } from '../services/api';
import ItemDetailModal from '../components/ItemDetailModal';
import {
  User,
  Package,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Trash2,
  ExternalLink,
  PlusCircle,
  Phone,
  Mail,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MyDashboard = ({ onOpenReportModal }) => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'claims'
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);

  const fetchMyData = async () => {
    try {
      setLoading(true);
      const res = await api.getMyReports();
      if (res.success) {
        setReports(res.reports || []);
        setClaims(res.claims || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const res = await api.updateItemStatus(id, newStatus);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      const res = await api.deleteItem(id);
      if (res.success) {
        setReports((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      alert('Failed to delete report');
    }
  };

  if (!user) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 max-w-md mx-auto space-y-4">
        <User className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800">Sign in to view your dashboard</h2>
        <p className="text-xs text-slate-500">Access your personal reports and claim notifications.</p>
        <Link
          to="/login"
          className="inline-block px-5 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-semibold"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-700 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {user.fullName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900">{user.fullName}</h1>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase font-mono">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              ID: {user.studentId} • {user.email}
            </p>
            {user.phoneNumber && (
              <p className="text-xs text-slate-500 mt-0.5">📞 {user.phoneNumber}</p>
            )}
          </div>
        </div>

        <button
          onClick={onOpenReportModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Report</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'reports'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Reported Items ({reports.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
            activeTab === 'claims'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>My Inquiries / Claims ({claims.length})</span>
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-sm">Loading your activity...</div>
      ) : activeTab === 'reports' ? (
        reports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
            <Package className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">No reports posted yet</h4>
            <p className="text-xs text-slate-500">
              When you report lost or found items, you can manage their status here.
            </p>
            <button
              onClick={onOpenReportModal}
              className="px-4 py-2 bg-sky-700 text-white rounded-xl text-xs font-semibold hover:bg-sky-800"
            >
              Post a Report
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => {
              const hasImg = report.images && report.images.length > 0;
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                      {hasImg ? (
                        <img
                          src={getImageUrl(report.images[0].imageUrl)}
                          alt={report.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">
                          No photo
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            report.type === 'LOST'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {report.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {report.category?.name}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          • #{report.id}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm">{report.title}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        📍 {report.locationName}
                      </p>

                      {report.claims && report.claims.length > 0 && (
                        <div className="mt-2 text-xs bg-amber-50 text-amber-900 p-2 rounded-lg border border-amber-200">
                          <strong>{report.claims.length} claim inquiry(ies) received:</strong>
                          <div className="mt-1 space-y-1">
                            {report.claims.map((c) => (
                              <div key={c.id} className="text-[11px] text-slate-700">
                                • {c.claimant?.fullName}: "{c.proofDetails}" (Contact: {c.contactNumber || c.claimant?.email})
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status Dropdown */}
                  <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-slate-500">Status:</span>
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLAIMED">CLAIMED</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setActiveItem(report)}
                        className="p-2 text-slate-600 hover:text-sky-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : claims.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="font-bold text-slate-800 text-sm">No inquiries filed</h4>
          <p className="text-xs text-slate-500">
            When you file a claim inquiry on an item you see in the directory, it will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Claim for Item: {claim.report?.title}
                </span>
                <span className="text-xs bg-amber-50 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200">
                  Status: {claim.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <strong>Your Proof Note:</strong> {claim.proofDetails}
              </p>
              <div className="text-[11px] text-slate-400">
                Submitted on {new Date(claim.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeItem && (
        <ItemDetailModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onItemUpdated={(updated, deletedId) => {
            if (deletedId) {
              setReports((prev) => prev.filter((r) => r.id !== deletedId));
              setActiveItem(null);
            } else if (updated) {
              setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
              setActiveItem(updated);
            }
          }}
        />
      )}
    </div>
  );
};

export default MyDashboard;
