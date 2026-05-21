"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Car, Ship, Bus, User,
  ChevronDown, ChevronRight,
  Menu, X, ArrowLeft,
  FileText, Search, BookOpen, LifeBuoy, PhoneCall,
  LogOut, ShieldCheck, BarChart3, Settings,
  Globe,
} from 'lucide-react'
import { motion, AnimatePresence, useInView } from "motion/react";
import { ELOGO, EPREFIX, EROUTES } from '@/utils/enums';
import { UseAuth } from '@/stores/auth-store';
import { getInitials } from '@/lib/format';
import { Link } from 'react-router-dom';
import { DropdownItem, MobileDrawerProps, NavbarProps, NavItem, TCountry } from '@/types/types';
import { Button } from '@/components/ui/button';
import { CountryDropdown } from '@/components/ui/country-dropdown';

/* ─── Nav data ───────────────────────────────────────────────────────────── */

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Insurance',
    dropdown: [
      { icon: Car, label: 'Motor Insurance', description: 'Cover for cars, trucks & motorcycles', href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
      { icon: Ship, label: 'Marine Insurance', description: 'Protection for cargo & shipping', href: `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}` },
      { icon: Bus, label: 'Travel Insurance', description: 'Worldwide travel peace of mind', href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
      { icon: User, label: 'Life Insurance', description: "Secure your family's future", href: `/${EPREFIX.CUSTOMER}${EROUTES.LIFE}` },
    ],
  },
  {
    label: 'Claims',
    dropdown: [
      { icon: FileText, label: 'File a Claim', description: 'Submit a new insurance claim', href: '#' },
      { icon: Search, label: 'Track a Claim', description: 'Check status of existing claims', href: '#' },
    ],
  },
  {
    label: 'Resources',
    dropdown: [
      { icon: BookOpen, label: 'Blog & Guides', description: 'Insurance tips and articles', href: '#' },
      { icon: LifeBuoy, label: 'Help Centre', description: 'FAQs and support articles', href: '#' },
    ],
  },
  {
    label: 'Contact',
    dropdown: [
      { icon: PhoneCall, label: 'Talk to Us', description: 'Reach our support team', href: EROUTES.CONTACT_US },
      { icon: User, label: 'Find an Agent', description: 'Connect with a local advisor', href: '#' },
    ],
  },
]

const LANG_NAMES: Record<string, string> = {
  eng: 'English', swa: 'Swahili', fra: 'French', kin: 'Kinyarwanda', tsn: 'Tswana',
}

const DesktopDropdown = ({ items }: { items: DropdownItem[] }) => (
  <motion.div
    initial={{ opacity: 0, y: 8, scale: 0.97 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 8, scale: 0.97 }}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className="fixed top-[65px] left-0 right-0 z-50 border-b border-gray-100 bg-white p-6 shadow-xl shadow-black/5">
    <div className="mx-auto max-w-7xl">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.href}
            className="flex items-start gap-4 rounded-xl p-3 transition-colors hover:bg-red-50/50 group">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#C20C0C] group-hover:bg-red-100 transition-colors">
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-[#C20C0C] transition-colors">
                {item.label}
              </p>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </motion.div>
)

const DesktopNavItem = ({ item }: { item: NavItem; isScrolled: boolean }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isActive = open;
  const baseText = 'text-sm font-semibold transition-colors duration-200';
  const activeColor = '#C20C0C';

  if (item.href && !item.dropdown) {
    return (
      <Link
        to={item.href}
        className={cn(baseText, 'text-gray-700 hover:text-[#C20C0C]')}>
        {item.label}
      </Link>
    );
  }
  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          baseText,
          'flex items-center gap-1 px-0 hover:bg-transparent',
          isActive ? 'text-[#C20C0C]' : 'text-gray-700 hover:text-[#C20C0C]',
        )}
        style={isActive ? { color: activeColor } : undefined}>
        {item.label}
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
          style={isActive ? { color: activeColor } : undefined}
        />
      </Button>
      <AnimatePresence>
        {open && item.dropdown && (
          <DesktopDropdown items={item.dropdown} />
        )}
      </AnimatePresence>
    </div>
  );
};


const MobileDrawer: React.FC<MobileDrawerProps> = ({
  open, onClose, isAuthenticated, user, userInitials, userName, userEmail, logout,
  alpha, handleCountryChange,
}) => {
  const [activePanel, setActivePanel] = useState<string | null>(null);
  useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setActivePanel(null), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  const closeAll = () => {
    onClose();
  };

  const openSub = (label: string) => setActivePanel(label);
  const closeSub = () => setActivePanel(null);
  const profileItem: NavItem = {
    label: 'Profile',
    dropdown: [
      {
        icon: ShieldCheck,
        label: 'My Covers',
        description: 'View and manage your policies',
        href: `/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`
      },
      {
        icon: BarChart3,
        label: 'Reports',
        description: 'Your reports and statements',
        href: EROUTES.REPORTS
      },
      {
        icon: Settings,
        label: 'Settings',
        description: 'Account and app settings',
        href: EROUTES.SETTINGS
      },
    ],
  };

  const mobileNavItems: NavItem[] = isAuthenticated
    ? [...NAV_ITEMS, profileItem]
    : NAV_ITEMS;

  const activeItem = mobileNavItems.find((i) => i.label === activePanel);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={closeAll}
        className={cn(
          'fixed inset-0 z-40 bg-black/40 lg:hidden transition-opacity duration-300',
          open ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white lg:hidden',
          'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
          open ? 'translate-x-0' : 'translate-x-full',
        )}>
        <div className="relative flex-1 overflow-hidden">
          <div className={cn(
            'absolute inset-0 flex flex-col',
            'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
            activePanel ? '-translate-x-full' : 'translate-x-0',
          )}>
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#C20C0C] px-5">
              <Link to={EROUTES.LANDING} onClick={closeAll} className="shrink-0">
                <img src={ELOGO.NAVBARLOGO} alt="Acentria" className="h-8 w-auto object-contain" />
              </Link>
              <div className="flex items-center gap-2">
                <CountryDropdown
                  defaultValue={alpha}
                  onChange={handleCountryChange}
                  slim={false}
                />
                <Button
                  onClick={closeAll}
                  variant="ghost"
                  className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Close menu">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {isAuthenticated && user && (
              <div className="flex items-center gap-3 px-5 py-4 border-b bg-gray-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#C20C0C] text-sm font-bold text-white">
                  {userInitials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
                  <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                </div>
              </div>
            )}
            <nav className="flex-1 overflow-y-auto px-4 py-3">
              <ul className="space-y-0.5">
                {mobileNavItems.map((item) => (
                  <li key={item.label}>
                    {item.dropdown ? (
                      <Button
                        variant="ghost"
                        onClick={() => openSub(item.label)}
                        className="flex w-full items-center justify-between rounded-xl px-4 py-4 text-left text-base font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#C20C0C] transition-colors">
                        <span className="flex items-center gap-3">
                          {item.label === 'Profile' && (
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#C20C0C] text-[11px] font-bold text-white shrink-0">
                              {userInitials}
                            </span>
                          )}
                          {item.label}
                        </span>
                        <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                      </Button>
                    ) : (
                      <Link
                        to={item.href!}
                        onClick={closeAll}
                        className="flex items-center rounded-xl px-4 py-4 text-base font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#C20C0C] transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="shrink-0 border-t border-gray-100 px-5 py-5 space-y-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  onClick={() => { logout(); closeAll(); }}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-red-200 px-6 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4" /> Log out
                </Button>
              ) : (
                <>
                  <Link
                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                    onClick={closeAll}
                    className="flex w-full items-center justify-center rounded-full border-2 border-[#C20C0C] px-6 py-3 text-sm font-bold text-[#C20C0C] hover:bg-red-50 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to={`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`}
                    onClick={closeAll}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-[#C20C0C] px-6 py-3 text-sm font-bold text-white hover:bg-[#a50a0a] transition-colors"
                  >
                    Get a Quote <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          <div
            className={cn(
              'absolute inset-0 flex flex-col bg-white',
              'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              activePanel ? 'translate-x-0' : 'translate-x-full',
            )}>
            {activeItem && (
              <>
                <div className="flex h-16 shrink-0 items-center gap-2 border-b border-[#C20C0C] px-3">
                  <Button
                    variant="ghost"
                    onClick={closeSub}
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Back">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span className="text-base font-bold text-gray-900">{activeItem.label}</span>
                  <Button
                    variant="ghost"
                    onClick={closeAll}
                    className="ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                    aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  <ul className="space-y-1">
                    {activeItem.dropdown?.map((sub) => (
                      <li key={sub.label}>
                        <Link
                          to={sub.href}
                          onClick={closeAll}
                          className="flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#C20C0C] transition-colors group">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-[#C20C0C] group-hover:bg-red-100 transition-colors">
                            <sub.icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 group-hover:text-[#C20C0C] transition-colors">
                              {sub.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 leading-snug">{sub.description}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-300 shrink-0" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </>
  );
};


/* ─── Main Navbar ────────────────────────────────────────────────────────── */
const Navbar: React.FC<NavbarProps> = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(headerRef, { once: true, amount: 0.1 });

  const { isAuthenticated, logout, user, setLocale, alpha, lang } = UseAuth();
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
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleCountryChange = (selected: TCountry) => {
    const primaryLang = selected.languages?.[0] ?? 'eng';
    setLocale(selected.name ?? '', primaryLang, selected.alpha2 ?? '');
  };

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ opacity: 0, y: -24 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300',
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200/60'
            : 'bg-white/90 border-b-2 border-[#C20C0C] shadow-md',
        )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <div className="flex items-center justify-between gap-6">
            <Link to={EROUTES.LANDING} className="shrink-0">
              <img
                src={ELOGO.NAVBARLOGO}
                alt="Acentria"
                className={cn('w-auto object-contain transition-all duration-300', isScrolled ? 'h-8' : 'h-10')}
              />
            </Link>
            <nav className="hidden lg:flex items-center gap-7">
              {NAV_ITEMS.map((item) => (
                <DesktopNavItem key={item.label} item={item} isScrolled={isScrolled} />
              ))}
              <div className="flex items-center gap-2 shrink-0 pl-2 border-l border-gray-200">
                <CountryDropdown
                  defaultValue={alpha}
                  onChange={handleCountryChange}
                  slim={false} />
                <span className="flex items-center gap-1 text-xs font-medium text-gray-500 whitespace-nowrap border-l border-gray-300 pl-2">
                  <Globe className="w-3 h-3 shrink-0" />
                  {LANG_NAMES[lang] ?? lang}
                </span>
              </div>
            </nav>
            <div className="hidden lg:flex items-center gap-3">
              {isAuthenticated ? (
                <div ref={profileRef} className="relative">
                  <Button
                    variant="ghost"
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center gap-2.5 rounded-full border border-gray-200 bg-white px-3 py-3 text-sm font-medium text-gray-700 shadow-sm hover:border-gray-300 transition-colors">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C20C0C] text-[12px] font-bold text-white">
                      {userInitials}
                    </span>
                    <span className="max-w-24 truncate">{userName}</span>
                    <ChevronDown className={cn('h-3.5 w-3.5 text-gray-400 transition-transform duration-200', profileOpen && 'rotate-180')} />
                  </Button>
                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.97 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl shadow-black/10"
                      >
                        <div className="border-b border-gray-100 px-3 pb-2.5 pt-1 mb-1">
                          <p className="text-xs font-semibold text-gray-900 truncate">{userName}</p>
                          <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                        </div>
                        <Link to={`/${EPREFIX.CUSTOMER}${EROUTES.MY_COVERS}`} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                          <ShieldCheck className="h-4 w-4" /> My Covers
                        </Link>
                        <Link to={EROUTES.REPORTS} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                          <BarChart3 className="h-4 w-4" /> Reports
                        </Link>
                        <Link to={EROUTES.SETTINGS} onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-[#C20C0C] transition-colors">
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <div className="border-t border-gray-100 mt-1 pt-1">
                          <Button onClick={() => { logout(); setProfileOpen(false); }} variant="ghost" className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                            <LogOut className="h-4 w-4" /> Log out
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                    className={cn('text-sm font-medium transition-colors duration-200',
                      isScrolled ? 'text-gray-700 hover:text-[#C20C0C]' : 'text-black hover:text-black/80'
                    )}>
                    Log in
                  </Link>
                  <Link
                    to={`/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}`}
                    className="flex items-center gap-2 rounded-full bg-[#BF162E] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#BF162E]/80 transition-colors duration-200">
                    Get a Quote <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </>
              )}
            </div>

            <div className="lg:hidden flex items-center gap-2">
              <CountryDropdown
                defaultValue={alpha}
                onChange={handleCountryChange}
                slim={false}
              />
              <Button
                variant="ghost"
                className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-gray-100 transition-colors focus-visible:outline-none"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileOpen}>
                <div className="relative h-5 w-5">
                  <Menu className={cn('absolute inset-0 h-5 w-5 transition-all duration-200',
                    mobileOpen ? 'rotate-90 opacity-0 scale-75' : 'rotate-0 opacity-100 scale-100'
                  )} />
                  <X className={cn('absolute inset-0 h-5 w-5 transition-all duration-200',
                    mobileOpen ? 'rotate-0 opacity-100 scale-100' : '-rotate-90 opacity-0 scale-75'
                  )} />
                </div>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>
      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        user={user}
        userInitials={userInitials}
        userName={userName}
        userEmail={userEmail}
        logout={logout}
        alpha={alpha}
        lang={lang}
        handleCountryChange={handleCountryChange}
      />
    </>
  );
};
export default Navbar;
