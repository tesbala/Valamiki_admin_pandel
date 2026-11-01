'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  Image, LogOut, ChevronRight, Mail, Settings, FileText,
} from 'lucide-react';
import { getActiveUsername, endSession, DEFAULT_ADMIN } from '@/lib/adminAuth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/categories', label: 'Categories', icon: Tag },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/dashboard/banners', label: 'Banners', icon: Image },
  { href: '/dashboard/blog', label: 'Blog', icon: FileText },
  { href: '/dashboard/users', label: 'Users', icon: Users },
  { href: '/dashboard/subscribers', label: 'Subscribers', icon: Mail },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [username, setUsername] = useState(DEFAULT_ADMIN.username);

  useEffect(() => {
    getActiveUsername().then(setUsername).catch(() => {});
  }, []);

  const handleSignOut = () => {
    endSession();
    router.replace('/login');
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col z-30">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md border border-gray-100 overflow-hidden">
            <img src="/logo.png" alt="Valamiki" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">VALAMIKI</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-3 mb-2">Menu</p>
        <ul className="space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    active
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={17} className={active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
                  <span className="flex-1">{label}</span>
                  {active && <ChevronRight size={14} className="text-blue-400" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Admin</p>
            <p className="text-[10px] text-gray-400 truncate">{username}</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 font-medium"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
