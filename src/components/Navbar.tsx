'use client';

import React from 'react';
import { Bell, Search, UserCheck, ExternalLink } from 'lucide-react';

interface NavbarProps {
  user?: { name: string; email: string; role: string } | null;
}

export default function Navbar({ user }: NavbarProps) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-bold text-slate-800 tracking-tight">
          Admin Dashboard
        </h2>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
          ● System Live
        </span>
      </div>

      {/* Right Navbar Controls */}
      <div className="flex items-center space-x-4">
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center space-x-1.5 text-xs font-medium text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-md hover:bg-slate-100 transition"
        >
          <span>Live Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <div className="h-4 w-px bg-slate-200 hidden md:block"></div>

        {/* User Profile Capsule */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-semibold text-xs flex items-center justify-center">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div className="hidden sm:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-none">
              {user?.name || 'Metrotimes Admin'}
            </span>
            <span className="block text-[10px] text-slate-500 capitalize mt-0.5">
              {user?.role || 'Administrator'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
