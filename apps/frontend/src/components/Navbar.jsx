'use client';

/**
 * @file Navbar.jsx
 * @description Global application header navigation.
 */

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Overview', href: '/' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Invoices', href: '/invoices' },
    { label: 'Payments', href: '/payments' },
    { label: 'AI Assistant', href: '/ai-assistant' }
  ];

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" className="navbar-brand">
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <span>PayPilot AI</span>
          <span className="brand-badge">Sandbox Ready</span>
        </Link>

        <ul className="navbar-links">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div>
          <Link href="/invoices/new" className="btn btn-primary btn-sm">
            + New Invoice
          </Link>
        </div>
      </div>
    </nav>
  );
}
