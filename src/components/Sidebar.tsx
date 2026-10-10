'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderTree,
  Newspaper,
  PlusCircle,
  LogOut,
  ShieldAlert,
  Globe,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  user?: { name: string; email: string; role: string } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/me', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Category & Sub-Category', href: '/dashboard/categories', icon: FolderTree },
    { label: 'All News Articles', href: '/dashboard/news', icon: Newspaper },
    { label: 'Create News Article', href: '/dashboard/news/create', icon: PlusCircle },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 shadow-sm flex items-center justify-center">
            <img
              src="/logo1.png"
              alt="Metrotimes"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-white text-sm leading-tight">Metrotimes</h1>
            <span className="text-[10px] text-red-400 font-mono tracking-widest uppercase font-semibold">
              Admin Portal
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
          Main Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href) && item.href !== '/dashboard/news/create');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info & Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 space-y-3">
        {user && (
          <div className="flex items-center space-x-3 px-2 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 uppercase">
              {user.name ? user.name[0] : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">{user.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user.email || 'admin@abpnews.com'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800/80 hover:bg-red-950/40 hover:text-red-400 hover:border-red-800/40 border border-slate-700 transition-all duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
