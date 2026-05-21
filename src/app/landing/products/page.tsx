import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/navbar'
import { Footer } from '../components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { EPREFIX, EROUTES } from '@/utils/enums'
import {
  LayoutGrid,
  Car,
  Bike,
  Bus,
  CarTaxiFront,
  Truck,
  CircleDot,
  HeartPulse,
  Plane,
  GraduationCap,
  Home,
  Briefcase,
  Shield,
  type LucideIcon,
} from 'lucide-react'

const BRAND = '#BF162E'

type ProductCategory = 'all' | 'car' | 'health' | 'travel' | 'life' | 'home' | 'business' | 'marine'

type ProductItem = {
  id: string
  title: string
  category: Exclude<ProductCategory, 'all'>
  icon: LucideIcon
  href: string
}

const FILTER_TABS: { id: ProductCategory; label: string; icon: LucideIcon }[] = [
  { id: 'all', label: 'All Products', icon: LayoutGrid },
  { id: 'car', label: 'Car', icon: Car },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'travel', label: 'Travel', icon: Plane },
  { id: 'life', label: 'Life', icon: Shield },
  { id: 'marine', label: 'Marine', icon: Briefcase },
]

const PRODUCTS: ProductItem[] = [
  { id: 'car-insurance', title: 'Car Insurance', category: 'car', icon: Car, href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
  { id: 'bike-insurance', title: 'Bike Insurance', category: 'car', icon: Bike, href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
  { id: 'bus', title: 'Bus', category: 'car', icon: Bus, href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
  { id: 'taxi-cab', title: 'Taxi/Cab', category: 'car', icon: CarTaxiFront, href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
  { id: 'truck', title: 'Truck', category: 'car', icon: Truck, href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
  { id: 'tuk-tuk', title: 'Tuk Tuk', category: 'car', icon: CircleDot, href: `/${EPREFIX.CUSTOMER}${EROUTES.MOTOR}` },
  { id: 'student-abroad', title: 'Student Abroad Cover', category: 'travel', icon: Plane, href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
  { id: 'student-travel', title: 'Student Travel', category: 'travel', icon: GraduationCap, href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
  { id: 'home-insurance', title: 'Home Insurance', category: 'home', icon: Home, href: '#' },
  { id: 'property-insurance', title: 'Property Insurance', category: 'business', icon: Briefcase, href: '#' },
  { id: 'annual-multi-trip', title: 'Annual Multi-Trip', category: 'travel', icon: Plane, href: `/${EPREFIX.CUSTOMER}${EROUTES.TRAVEL}` },
  { id: 'life-insurance', title: 'Life Insurance', category: 'life', icon: Shield, href: `/${EPREFIX.CUSTOMER}${EROUTES.LIFE}` },
  { id: 'marine-insurance', title: 'Marine Insurance', category: 'business', icon: Briefcase, href: `/${EPREFIX.CUSTOMER}${EROUTES.MARINE}` },
  { id: 'health-cover', title: 'Health Cover', category: 'health', icon: HeartPulse, href: '#' },
]

function FilterPill({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean
  label: string
  icon: LucideIcon
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors shrink-0',
        active
          ? 'text-white'
          : 'bg-white text-[#111111] border border-[#E4E4E7] hover:border-[#BF162E]/40'
      )}
      style={active ? { backgroundColor: BRAND } : undefined}
    >
      <Icon
        className={cn('h-4 w-4 shrink-0', active ? 'text-white' : '')}
        style={active ? undefined : { color: BRAND }}
      />
      {label}
    </button>
  )
}

function ProductCard({ product }: { product: ProductItem }) {
  const Icon = product.icon
  const isExternal = product.href === '#'

  const button = (
    <span className="flex w-full items-center justify-center rounded-full border border-[#E4E4E7] bg-white px-4 py-2.5 text-sm font-medium text-[#111111] transition-colors hover:border-[#BF162E]/50 hover:text-[#BF162E]">
      Get covered
    </span>
  )

  return (
    <Card className="shadow-none border border-[#EAEAEA] rounded-xl py-0 gap-0">
      <CardContent className="flex flex-col gap-4 px-5 pt-5 pb-5">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-lg shrink-0"
          style={{ backgroundColor: 'rgba(191, 22, 46, 0.08)' }}
        >
          <Icon className="h-5 w-5" style={{ color: BRAND }} strokeWidth={1.75} />
        </div>
        <h3 className="text-sm font-bold text-[#111111] leading-snug">{product.title}</h3>
        {isExternal ? (
          <div className="mt-auto">{button}</div>
        ) : (
          <Link to={product.href} className="mt-auto block">
            {button}
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

export const ProductsListPage = () => {
  const [activeFilter, setActiveFilter] = useState<ProductCategory>('all')

  const filteredProducts = useMemo(() => {
    if (activeFilter === 'all') return PRODUCTS
    return PRODUCTS.filter((p) => p.category === activeFilter)
  }, [activeFilter])

  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <div className="relative w-full h-48 sm:h-56 lg:h-64 overflow-hidden">
          <img
            src="/product.webp"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-linear-to-r from-slate-900/60 to-slate-900/40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pt-16 sm:pt-20">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 sm:mb-3">
              What are you protecting today?
            </h1>
            <p className="text-white/75 max-w-xl text-sm sm:text-base leading-relaxed">
              Browse our full range of insurance products and find the right protection for you,
              your family, or your business.
            </p>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-1 -mx-1 px-1">
            {FILTER_TABS.map((tab) => (
              <FilterPill
                key={tab.id}
                active={activeFilter === tab.id}
                label={tab.label}
                icon={tab.icon}
                onClick={() => setActiveFilter(tab.id)}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-center text-sm text-[#71717A] py-16">
              No products in this category yet.
            </p>
          )}
        </section>
      </main>
      <Footer />
    </div>
  )
}
