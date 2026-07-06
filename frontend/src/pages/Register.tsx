import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { apiRequest } from '../utils/api.js';
import { GraduationCap, ArrowRight, ShieldCheck, Users, GraduationCap as MortarBoard, BookOpen } from 'lucide-react';

export const Register: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'MENTOR'>('STUDENT');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Try using a unique email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-61px)] flex flex-col items-center justify-center bg-slate-50 px-4 py-8">
      {/* Brand logo */}
      <div className="flex items-center space-x-2 text-2xl font-bold text-slate-800 mb-8">
        <BookOpen className="h-8 w-8 text-brand" />
        <span>AlumniConnect</span>
      </div>

      {/* Main card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-8 relative overflow-hidden">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Join the Network</h2>
          <p className="text-sm text-slate-500 mt-1">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector FIRST — prominent card-style */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">I am joining as a:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('STUDENT')}
                className={`py-4 rounded-xl border-2 flex flex-col items-center space-y-1.5 transition-all ${
                  role === 'STUDENT'
                    ? 'border-brand bg-teal-50 text-brand shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <Users className="h-5 w-5" />
                <span className="font-bold text-sm">Student</span>
                <span className="text-[10px] font-normal text-center leading-tight opacity-70">Looking for mentorship & guidance</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('MENTOR')}
                className={`py-4 rounded-xl border-2 flex flex-col items-center space-y-1.5 transition-all ${
                  role === 'MENTOR'
                    ? 'border-brand bg-teal-50 text-brand shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-500'
                }`}
              >
                <MortarBoard className="h-5 w-5" />
                <span className="font-bold text-sm">Alumni Mentor</span>
                <span className="text-[10px] font-normal text-center leading-tight opacity-70">Giving back to the community</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5 text-center">⚠ This cannot be changed after registration</p>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

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
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand hover:bg-brand-dark text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center space-x-2 transition-all active-scale disabled:opacity-50 mt-2 shadow-md"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-brand hover:underline font-semibold">
            Sign In
          </Link>
        </div>
      </div>

      {/* Info Footnotes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md mt-6">
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-start space-x-3">
          <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">Verified Network</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Alumni mentors are verified against university records.</p>
          </div>
        </div>
        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 flex items-start space-x-3">
          <GraduationCap className="h-5 w-5 text-teal-600 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-slate-800">10,000+ Members</h4>
            <p className="text-[10px] text-slate-500 mt-0.5">Join students and alumni from across 40+ countries.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
