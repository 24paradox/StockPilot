'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Tags,
  Truck,
  Users,
  ShoppingCart,
  ShoppingBag,
  History,
  AlertTriangle,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Tags },
    { name: 'Suppliers', href: '/suppliers', icon: Truck },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'New Sale', href: '/sales/new', icon: ShoppingCart },
    { name: 'New Purchase', href: '/purchases/new', icon: ShoppingBag },
    { name: 'History', href: '/history', icon: History },
    { name: 'Low Stock', href: '/low-stock', icon: AlertTriangle },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 bg-surface border-r border-theme flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 px-5 border-b border-theme flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-theme group">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 shadow-md group-hover:scale-105 transition-transform">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="tracking-tight">Stock<span className="text-amber-500">Pilot</span></span>
              <span className="block text-[10px] font-medium text-muted-theme tracking-wide -mt-0.5">
                Inventory Management
              </span>
            </div>
          </Link>

          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-muted-theme hover:text-theme hover:bg-surface-hover transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted-theme">
            Navigation
          </div>

          {navigation.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');

            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => {
                  if (window.innerWidth < 768) onClose();
                }}
                className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-500 dark:text-amber-400 font-semibold border-l-3 border-amber-500'
                    : 'text-muted-theme hover:text-theme hover:bg-surface-hover'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-500' : 'opacity-80'}`} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* System status footer */}
        <div className="p-4 border-t border-theme bg-surface-hover/20">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-muted-theme">System Online</span>
          </div>
          <p className="text-[11px] text-muted-theme/80 leading-tight mt-1">
            StockPilot &bull; Inventory Management
          </p>
        </div>
      </aside>
    </>
  );
}
