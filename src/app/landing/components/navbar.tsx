"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Car,
  Ship,
  Bus,
  User,
  ChevronDown,
  Menu,
  X,
  FileText,
  Search,
  BookOpen,
  LifeBuoy,
  PhoneCall,
  LogOut,
  ShieldCheck,
  BarChart3,
  Settings,
} from 'lucide-react'
import { motion, AnimatePresence, useInView } from "motion/react";
import { ELOGO, EPREFIX, EROUTES } from '@/utils/enums';
import { UseAuth } from '@/stores/auth-store';
import { getInitials } from '@/lib/format';
import { Link } from 'react-router-dom';

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type NavLinkItem = {
  name: string
  label?: string
  href: string
  isActive?: boolean
}

export interface NavLinkProps {
  item: NavLinkItem
}

interface DropdownItem {
  icon: React.ElementType
  label: string
  description: string
  href: string
}

interface NavItem {
  label: string
  href?: string
  dropdown?: DropdownItem[]
}

/* ─── Nav config ─────────────────────────────────────────────────────────── */

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Insurance',
    dropdown: [
      {
        icon: Car,
        label: 'Motor Insurance',
        description: 'Cover for cars, trucks & motorcycles',
        href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`,
      },
      {
        icon: Ship,
        label: 'Marine Insurance',
        description: 'Protection for cargo & shipping',
        href: `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}`,
      },
      {
        icon: Bus,
        label: 'Travel Insurance',
        description: 'Worldwide travel peace of mind',
        href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}`,
      },
      {
        icon: User,
        label: 'Life Insurance',
        description: "Secure your family's future",
        href: `/${EPREFIX.CUSTOMER}${EROUTES.LIFE}`,
      },
    ],
  },
  {
    label: 'Claims',
    dropdown: [
      {
        icon: FileText,
        label: 'File a Claim',
        description: 'Submit a new insurance claim',
        href: '#',
      },
      {
        icon: Search,
        label: 'Track a Claim',
        description: 'Check status of existing claims',
        href: '#',
      },
    ],
  },
  {
    label: 'Resources',
    dropdown: [
      {
        icon: BookOpen,
        label: 'Blog & Guides',
        description: 'Insurance tips and articles',
        href: '#',
      },
      {
        icon: LifeBuoy,
        label: 'Help Centre',
        description: 'FAQs and support articles',
        href: '#',
      },
    ],
  },
  {
    label: 'Contact',
    dropdown: [
      {
        icon: PhoneCall,
        label: 'Talk to Us',
        description: 'Reach our support team',
        href: EROUTES.CONTACT_US,
      },
      {
        icon: User,
        label: 'Find an Agent',
        description: 'Connect with a local advisor',
        href: '#',
      },
    ],
  },
]

/* ─── Desktop mega-dropdown ──────────────────────────────────────────────── */

const DesktopDropdown = ({ items }: { items: DropdownItem[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.97 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50 min-w-64 rounded-2xl border border-gray-100 bg-white p-2 shadow-xl shadow-black/10">
    {items.map((item) => (
      <Link
        key={item.label}
        to={item.href}
        className="flex items-start gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-red-50 group"
      >
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#C20C0C] group-hover:bg-red-100 transition-colors">
          <item.icon className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 group-hover:text-[#C20C0C] transition-colors">
            {item.label}
          </p>
          <p className="mt-0.5 text-xs text-gray-500 leading-snug">
            {item.description}
          </p>
        </div>
      </Link>
    ))}
  </motion.div>
)

const DesktopNavItem = ({ item, isScrolled }: { item: NavItem; isScrolled: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const textClass = isScrolled
    ? 'text-gray-700 hover:text-[#C20C0C]'
    : 'text-gray-700 hover:text-[#C20C0C]';

  if (item.href && !item.dropdown) {
    return (
      <Link
        to={item.href}
        className={cn(
          'text-sm font-semibold transition-colors duration-200',
          textClass
        )}>
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn('flex items-center gap-1 text-sm font-semibold transition-colors duration-200',
          textClass
        )}>
        {item.label}
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {open && item.dropdown && <DesktopDropdown items={item.dropdown} />}
      </AnimatePresence>
    </div>
  );
};

/* ─── Mobile nav item ────────────────────────────────────────────────────── */

const MobileNavItem = ({
  item,
  onClose,
}: {
  item: NavItem;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(false);

  if (item.href && !item.dropdown) {
    return (
      <Link
        to={item.href}
        onClick={onClose}
        className="block py-3 text-sm font-semibold text-gray-800 hover:text-[#C20C0C] border-b border-gray-100 transition-colors">
        {item.label}
      </Link>
    );
  }

  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-gray-800 hover:text-[#C20C0C] transition-colors">
        {item.label}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence>
        {open && item.dropdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-3 pl-2 space-y-1">
              {item.dropdown.map((sub) => (
                <Link
                  key={sub.label}
                  to={sub.href}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-600 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                  <sub.icon className="h-4 w-4 shrink-0 text-[#C20C0C]" />
                  {sub.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Navbar ────────────────────────────────────────────────────────── */

type NavbarProps = {
  navData?: NavLinkItem[]
}

const Navbar: React.FC<NavbarProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.1 });

  const { isAuthenticated, logout, user } = UseAuth();
  const userName = user?.name ?? 'User';
  const userEmail = user?.email ?? '';
  const userInitials = getInitials(userName);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <motion.header
      ref={headerRef}
      initial={{ opacity: 0, y: -24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200/60'
          : 'bg-white/90 text-gray-700 border-[#C20C0C] border-b-2 shadow-md'
      )}>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-6">

          {/* Logo */}
          <Link to={EROUTES.LANDING} className="shrink-0">
            <img
              src={ELOGO.NAVBARLOGO}
              alt="Acentria"
              className={cn('w-auto object-contain transition-all duration-300',
                isScrolled ? 'h-8' : 'h-10'
              )}
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {NAV_ITEMS.map((item) => (
              <DesktopNavItem key={item.label} item={item} isScrolled={isScrolled} />
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Avatar button */}
                <div className="relative group">
                  <button className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 transition-colors">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#C20C0C] text-[10px] font-bold text-white">
                      {userInitials}
                    </span>
                    <span className="max-w-24 truncate">{userName}</span>
                    <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                  </button>
                  {/* User dropdown */}
                  <div className="absolute right-0 top-full mt-2 hidden w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-black/10 group-hover:block">
                    <div className="border-b border-gray-100 px-3 pb-2.5 pt-1 mb-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                      <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                    </div>
                    <Link to={`/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                      <ShieldCheck className="h-4 w-4" /> My Covers
                    </Link>
                    <Link to={EROUTES.REPORTS} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                      <BarChart3 className="h-4 w-4" /> Reports
                    </Link>
                    <Link to={EROUTES.SETTINGS} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                      <Settings className="h-4 w-4" /> Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" /> Log out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                  className={cn(
                    'text-sm font-medium transition-colors duration-200',
                    isScrolled ? 'text-gray-700 hover:text-[#C20C0C]' : 'text-black hover:text-black/80'
                  )}
                >
                  Log in
                </Link>
                <Link
                  to={`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`}
                  className="flex items-center gap-2 rounded-full bg-[#BF162E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#BF162E]/80 transition-colors duration-200"
                >
                  Get a Quote
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className={cn(
              'lg:hidden flex items-center justify-center h-9 w-9 rounded-xl transition-colors',
              isScrolled ? 'text-gray-700 hover:bg-gray-100' : 'text-white hover:bg-white/10'
            )}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 right-4 mt-2 rounded-2xl border border-gray-100 bg-white shadow-xl shadow-black/10 overflow-hidden lg:hidden"
          >
            <div className="max-h-[80vh] overflow-y-auto p-4">
              {isAuthenticated && user && (
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C20C0C] text-sm font-bold text-white">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                    <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                  </div>
                </div>
              )}

              {/* Nav items */}
              <div className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <MobileNavItem
                    key={item.label}
                    item={item}
                    onClose={() => setMobileOpen(false)}
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link
                      to={`/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#C20C0C]" /> My Covers
                    </Link>
                    <button
                      onClick={() => { logout(); setMobileOpen(false); }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" /> Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center h-10 w-full rounded-xl border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors">
                      Log in
                    </Link>
                    <Link
                      to={`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-center gap-2 h-10 w-full rounded-xl bg-[#BF162E] text-sm font-semibold text-white hover:bg-[#BF162E]/80 transition-colors">
                      Get a Quote <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
