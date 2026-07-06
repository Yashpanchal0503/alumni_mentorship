import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../utils/api.js';
import { BookOpen, ArrowRight, Eye, EyeOff, ShieldCheck, GraduationCap } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center bg-slate-50 px-4 py-8">
      {/* Brand logo header */}
      <div className="flex items-center space-x-2 text-2xl font-bold text-slate-800 mb-8">
        <BookOpen className="h-8 w-8 text-brand" />
        <span>AlumniConnect</span>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-sm text-slate-500 mt-1">Access your mentorship network</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@university.edu"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-slate-600">Password</label>
              <button
                type="button"
                className="text-xs text-brand hover:underline font-semibold"
                onClick={() => alert('Password reset is under development.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center space-x-2 transition-all active-scale disabled:opacity-50 mt-2 shadow-md"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand hover:underline font-semibold">
            Join the network
          </Link>
        </div>
      </div>

      {/* Info Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-6">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Secure Access</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">All accounts are verified and protected.</p>
          </div>
        </div>
        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 flex items-start space-x-3">
          <GraduationCap className="h-5 w-5 text-teal-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">10,000+ Members</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Network with alumni active in over 40 countries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
