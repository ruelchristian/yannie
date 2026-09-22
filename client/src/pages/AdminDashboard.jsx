import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ItemDetailModal from '../components/ItemDetailModal';
import {
  Shield,
  Users,
  Package,
  CheckCircle,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [activeTab, setActiveTab] = useState('reports'); // 'reports' | 'users'
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getItems({ limit: 100 }),
        api.getAdminUsers(),
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (reportsRes.success) setReports(reportsRes.items);
      if (usersRes.success) setUsersList(usersRes.users);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  if (authLoading) return null;
  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.updateUserRole(userId, newRole);
      if (res.success) {
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (e) {
      alert('Failed to update role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user account? All their reports and claims will be removed.')) return;
    try {
      const res = await api.deleteUser(userId);
      if (res.success) {
        setUsersList((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch (e) {
      alert('Failed to delete user');
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      const res = await api.updateItemStatus(reportId, newStatus);
      if (res.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (e) {
      alert('Failed to update status');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to remove this report as an administrator?')) return;
    try {
      const res = await api.deleteItem(reportId);
      if (res.success) {
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      }
    } catch (e) {
      alert('Failed to delete report');
    }
  };

  const filteredReports = reports.filter((r) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      r.locationName.toLowerCase().includes(q) ||
      r.user?.fullName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
              <Shield className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Administration & Oversight Panel
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">ICCT Cainta Directory Control</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage reports, moderate submissions, oversee registered users, and track campus recovery metrics.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Reports</div>
            <div className="text-3xl font-black text-slate-900">{stats.totalReports}</div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
              <span>{stats.totalLost} Lost</span> • <span>{stats.totalFound} Found</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Resolved Items</div>
            <div className="text-3xl font-black text-emerald-600">{stats.resolvedReports}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Returned or claim closed
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">Active Inquiries</div>
            <div className="text-3xl font-black text-amber-600">{stats.activeReports}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Awaiting matching or return
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Registered Users</div>
            <div className="text-3xl font-black text-sky-700">{stats.totalUsers}</div>
            <div className="text-[11px] text-slate-500 mt-1">
              Students, staff & admins
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'reports'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              All Directory Reports ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'users'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60'
              }`}
            >
              User Accounts ({usersList.length})
            </button>
          </div>

          {activeTab === 'reports' && (
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter by title, owner, location..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Tab 1: Reports Table */}
        {activeTab === 'reports' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Reporter</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900 max-w-xs truncate">
                      {report.title}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          report.type === 'LOST'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {report.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">{report.category?.name}</td>
                    <td className="py-3.5 px-4">{report.user?.fullName}</td>
                    <td className="py-3.5 px-4 max-w-[150px] truncate">{report.locationName}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusChange(report.id, e.target.value)}
                        className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLAIMED">CLAIMED</option>
                        <option value="RETURNED">RETURNED</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setActiveItem(report)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded-lg"
                          title="Inspect"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete Report"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tab 2: Users Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Student/Employee ID</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Reports</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{u.fullName}</td>
                    <td className="py-3.5 px-4 font-mono">{u.studentId}</td>
                    <td className="py-3.5 px-4">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <select
                        value={u.role}
                        disabled={u.id === user.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="text-xs font-semibold py-1 px-2 rounded-lg border border-slate-200 bg-white"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{u._count?.reports || 0}</td>
                    <td className="py-3.5 px-4 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default AdminDashboard;
