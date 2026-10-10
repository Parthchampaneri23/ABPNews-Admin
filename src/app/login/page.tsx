'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, AlertCircle, ShieldCheck, Newspaper } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      // Successful login -> Redirect to Admin Dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError('An unexpected network error occurred.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Radial Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-900/20 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl p-8 backdrop-blur-sm z-10">
        {/* Brand Header */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="mb-4 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 shadow-xl inline-block">
            <img
              src="/logo1.png"
              alt="Metrotimes Logo"
              className="h-12 w-auto object-contain drop-shadow-md"
            />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Metrotimes Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Sign in to access news, categories & media management dashboard
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="mb-6 p-3 bg-slate-800/60 border border-slate-700/60 rounded-lg text-xs text-slate-300">
          <div className="flex items-center space-x-1.5 font-semibold text-red-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Default Seed Credentials:</span>
          </div>
          <p><span className="text-slate-400">Email:</span> admin@metrotimes.com (or admin@abpnews.com)</p>
          <p><span className="text-slate-400">Password:</span> admin123</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-center space-x-2 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@metrotimes.com"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm shadow-md shadow-red-600/20 transition-all duration-150 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Metrotimes Content Management System &copy; 2026
        </div>
      </div>
    </div>
  );
}
