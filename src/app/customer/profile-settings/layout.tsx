import { Footer } from '@/app/landing/components/footer'
import Navbar from '@/app/landing/components/navbar'
import { cn } from '@/lib/utils'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { NavLink, Outlet } from 'react-router-dom'

const profileLinks = [
  { label: 'My Covers', to: `/${EPREFIX.CUSTOMER}${EROUTES.COVERS}` },
  { label: 'My Claims', to: `/${EPREFIX.CUSTOMER}${EROUTES.CLAIMS}` },
  { label: 'Account Settings', to: `/${EPREFIX.CUSTOMER}${EROUTES.ACCOUNTSETTINGS}` },
]

export const CustomerProfileLayout = () => {
  return (
    <div className="min-h-screen]">
      <Navbar />
      <main>
        <div className="relative w-full h-44 sm:h-56 lg:h-64 overflow-hidden">
          <img
            src="/profile.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/65 to-slate-900/45" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3">
              My Account
            </h1>
            <p className="text-white/75 max-w-xl text-sm sm:text-base leading-relaxed">
              Manage your covers, claims, and account settings in one place.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <nav
            aria-label="Profile sections"
            className="flex flex-wrap gap-2 sm:gap-3 mb-8 sm:mb-10">
            {profileLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className={({ isActive }) =>
                  cn(
                    'inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[#BF162E] text-white'
                      : 'bg-white text-[#111111] border border-[#E4E4E7] hover:border-[#BF162E]/40 hover:text-[#BF162E]'
                  )
                }>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  )
}
