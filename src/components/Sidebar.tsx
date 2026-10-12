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
  UserCheck,
  Sliders,
  Video
} from 'lucide-react';

interface SidebarProps {
  user?: { name: string; email: string; role: string } | null;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [logoSrc, setLogoSrc] = React.useState('/logoupdate.png');

  React.useEffect(() => {
    const loadLogo = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings?.logoUrl) {
          setLogoSrc(data.settings.logoUrl);
        }
      } catch (e) {
        // fallback
      }
    };
    loadLogo();

    const handleUpdate = () => loadLogo();
    window.addEventListener('site-settings-updated', handleUpdate);
    return () => window.removeEventListener('site-settings-updated', handleUpdate);
  }, []);

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
    { label: 'Video Management', href: '/dashboard/videos', icon: Video },
    { label: 'Logo & Favicon Manage', href: '/dashboard/logo-favicon', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white text-slate-800 flex flex-col h-screen sticky top-0 border-r border-slate-200/80 shadow-xs select-none z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-slate-100 bg-white">
        <Link href="/dashboard" className="flex items-center">
          <img
            src={logoSrc}
            alt="Metrotimes"
            className="h-7 w-auto max-w-[175px] object-contain"
          />
        </Link>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-5 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-bold text-slate-400 tracking-wider uppercase">
          Main Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' &&
              item.href !== '/dashboard/news' &&
              pathname.startsWith(item.href)) ||
            (item.href === '/dashboard/news' &&
              pathname.startsWith('/dashboard/news') &&
              pathname !== '/dashboard/news/create');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* User Info & Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/70 space-y-3">
        {user && (
          <div className="flex items-center space-x-3 px-3 py-2 rounded-xl bg-white border border-slate-200/70 shadow-2xs">
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-white uppercase shadow-2xs">
              {user.name ? user.name[0] : 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">{user.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user.email || 'admin@metrotimes.com'}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-slate-200/80 shadow-2xs transition-all duration-150 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
