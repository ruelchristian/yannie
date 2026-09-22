import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, AlertCircle, Shield, User, Lock, Key } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await login({ email, password });
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Invalid credentials.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (quickEmail, quickPass) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center mx-auto mb-2">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign In to ICCT Directory</h2>
          <p className="text-xs text-slate-500">Access reports, submit claims, and manage personal posts</p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 text-rose-800 text-xs rounded-2xl border border-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email or Student/Employee ID
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. 2023-01042 or user@icct.edu.ph"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Quick Demo Logins for Testing */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Key className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Demo Accounts:</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@icct.edu.ph', 'admin123')}
              className="px-2 py-1.5 bg-slate-100 hover:bg-amber-50 hover:text-amber-800 text-[11px] font-semibold text-slate-700 rounded-lg border border-slate-200 transition-colors"
            >
              🛡️ Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('yeinnee@icct.edu.ph', 'student123')}
              className="px-2 py-1.5 bg-slate-100 hover:bg-sky-50 hover:text-sky-700 text-[11px] font-semibold text-slate-700 rounded-lg border border-slate-200 transition-colors"
            >
              🎓 Student
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('security@icct.edu.ph', 'staff123')}
              className="px-2 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-semibold text-slate-700 rounded-lg border border-slate-200 transition-colors"
            >
              👮 Staff
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-sky-700 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
