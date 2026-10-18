'use client';

import React from 'react';
import { Menu, Plus } from 'lucide-react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/90 backdrop-blur-md border-b border-theme px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg border border-theme text-theme hover:bg-surface-hover transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick new sale button */}
        <Link
          href="/sales/new"
          className="btn-primary text-xs !py-1.5 !px-3 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New Sale</span>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
