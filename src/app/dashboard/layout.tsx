import React from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  const payload = verifyToken(token);
  if (!payload) {
    redirect('/login');
  }

  // Fetch updated user from database if possible so profile changes reflect immediately
  let user: { name: string; email: string; role: string } = {
    name: payload.name || 'Metrotimes Admin',
    email: payload.email || 'admin@metrotimes.com',
    role: payload.role || 'admin',
  };

  try {
    const { connectDB } = await import('@/lib/db');
    const User = (await import('@/models/User')).default;
    await connectDB();
    const dbUser = await User.findById(payload.userId).lean();
    if (dbUser) {
      user = {
        name: (dbUser as any).name || user.name,
        email: (dbUser as any).email || user.email,
        role: (dbUser as any).role || user.role,
      };
    }
  } catch (e) {
    // fallback to token payload
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
