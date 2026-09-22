import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  MapPin,
  PlusCircle,
  Shield,
  LogOut,
  LogIn,
  Menu,
  X,
  Package,
  Home as HomeIcon,
} from 'lucide-react';

const Navbar = ({ onOpenReportModal }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleNavClick = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center space-x-2.5 sm:space-x-3 group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-700 via-sky-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-sky-900/10 group-hover:scale-105 transition-transform">
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
                ICCT Cainta <span className="text-sky-600 text-[10px] sm:text-xs font-semibold px-2 py-0.5 bg-sky-50 rounded-full border border-sky-100">Lost & Found</span>
              </span>
              <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium -mt-0.5 sm:-mt-1 hidden xs:block">Campus Directory & Recovery</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
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

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Report button */}
            <button
              onClick={() => {
                if (onOpenReportModal) onOpenReportModal();
                else navigate('/report');
              }}
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </button>

            {/* Desktop Auth */}
            {user ? (
              <div className="hidden md:flex items-center space-x-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.fullName.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{user.role}</div>
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
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-slate-700 hover:text-sky-700 hover:bg-slate-100 text-xs font-semibold transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}

            {/* Mobile Report Quick Icon (for very small screens) */}
            <button
              onClick={() => {
                if (onOpenReportModal) onOpenReportModal();
              }}
              className="sm:hidden p-2 rounded-xl bg-sky-700 text-white shadow-sm"
              title="Report Item"
            >
              <PlusCircle className="w-4 h-4" />
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <nav className="space-y-1">
            <button
              onClick={() => handleNavClick('/')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/') ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <HomeIcon className="w-4 h-4 text-sky-600" />
              <span>Browse Directory</span>
            </button>

            <button
              onClick={() => handleNavClick('/map')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive('/map') ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <MapPin className="w-4 h-4 text-sky-600" />
              <span>Interactive Campus Map</span>
            </button>

            {user && (
              <button
                onClick={() => handleNavClick('/my-dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/my-dashboard') ? 'bg-sky-50 text-sky-700' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Package className="w-4 h-4 text-sky-600" />
                <span>My Reports & Claims</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => handleNavClick('/admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive('/admin') ? 'bg-amber-50 text-amber-900' : 'text-slate-700 hover:bg-amber-50/50'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Admin Moderation Panel</span>
              </button>
            )}
          </nav>

          <div className="pt-3 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenReportModal) onOpenReportModal();
              }}
              className="w-full py-2.5 px-4 bg-sky-700 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Lost or Found Item</span>
            </button>

            {user ? (
              <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">{user.fullName}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{user.studentId} • {user.role}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 font-semibold rounded-lg border border-rose-200 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleNavClick('/login')}
                  className="w-full py-2 px-3 text-center border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNavClick('/register')}
                  className="w-full py-2 px-3 text-center bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
