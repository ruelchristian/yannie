import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, MapPin, PlusCircle, User, Shield, LogOut, LogIn, Sparkles } from 'lucide-react';

const Navbar = ({ onOpenReportModal }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sky-900/10 group-hover:scale-105 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                ICCT Cainta <span className="text-sky-600 text-xs font-semibold px-2 py-0.5 bg-sky-50 rounded-full border border-sky-100">Lost & Found</span>
              </span>
              <p className="text-[11px] text-slate-500 font-medium -mt-1 hidden sm:block">Campus Directory & Recovery System</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              Browse Directory
            </Link>
            <Link
              to="/map"
              className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/map') ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <MapPin className="w-4 h-4 text-sky-500" />
              Campus Map
            </Link>

            {user && (
              <Link
                to="/my-dashboard"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/my-dashboard') ? 'bg-sky-50 text-sky-700 font-semibold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                My Reports
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  isActive('/admin') ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-slate-600 hover:text-amber-800 hover:bg-amber-50/50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Action & User Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                if (onOpenReportModal) {
                  onOpenReportModal();
                } else {
                  navigate('/report');
                }
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white text-sm font-semibold shadow-sm hover:shadow transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </button>

            {user ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{user.studentId} • <span className="capitalize font-semibold text-sky-700">{user.role.toLowerCase()}</span></div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  title="Sign out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-slate-700 hover:text-sky-700 hover:bg-slate-100 text-sm font-medium transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
