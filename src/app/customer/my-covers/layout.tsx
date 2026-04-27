import { useState } from 'react'
import { Navbar } from '@/app/landing/components/navbar'
import { UseAuth } from '@/stores/auth-store'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, UserMenuPopover } from '@/dev/core'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createHeroPopoverItems, myAccounttLinks, sidebarLinks } from '@/utils/constatnts'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { ChevronDown } from 'lucide-react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { StatsCard, StatsGrid } from '@/components/shared'

export function MyCoversLayout() {
    const { isAuthenticated, logout, user } = UseAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const userName = user?.name ?? "User"
    const userEmail = user?.email ?? ""
    const userInitials = getInitials(userName)
    const heroPopoverItems = createHeroPopoverItems(logout)

    const sidebarNav = (
        <nav className="space-y-1">
            {sidebarLinks.map((link) => {
                const isActive = link.to === `/${location.pathname.split('/').slice(1, 3).join('/')}`
                    ? location.pathname === link.to || location.pathname === `${link.to}/`
                    : location.pathname.startsWith(link.to)
                return (
                    <Button
                        key={link.label}
                        variant={isActive ? "secondary" : "ghost"}
                        onClick={() => { navigate(link.to); setSidebarOpen(false); }}
                        className={cn(
                            "w-full justify-start",
                            isActive && "font-semibold"
                        )}>
                        {link.label}
                    </Button>
                )
            })}
            <Separator className="my-2" />
            <div className="space-y-1">
                {myAccounttLinks.map((link) => {
                    const isActive = location.pathname.startsWith(link.to)
                    return (
                        <Button
                            key={link.label}
                            variant={isActive ? "secondary" : "ghost"}
                            onClick={() => { navigate(link.to); setSidebarOpen(false); }}
                            className={cn(
                                "w-full justify-start text-muted-foreground",
                                isActive && "font-semibold text-foreground"
                            )}>
                            {link.label}
                        </Button>
                    )
                })}
            </div>
            <Separator className="my-2" />
            <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={logout}>
                Logout
            </Button>
        </nav>
    )

    return (
        <main className="relative flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mb-3">
            {isAuthenticated ? (
                <UserMenuPopover
                    className="absolute hidden lg:block top-4 right-22 z-10 rounded-full border border-[#C20C0C] bg-white"
                    userInitials={userInitials}
                    userName={userName}
                    userEmail={userEmail}
                    items={heroPopoverItems}
                />
            ) : (
                <Link
                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                    className="absolute hidden lg:flex top-4.75 right-22 z-10 h-6.5 w-20.5 items-center justify-center rounded-[20px] border border-[#C20C0C] bg-white text-sm font-semibold text-slate-900">
                    Login
                </Link>
            )}
            <Navbar className='bg-[#ADABAB30] w-full h-auto lg:h-43.75 rounded-2xl backdrop-blur-[3.379px]' textStyle='text-[#141414]' navTextStyle="text-[#000000]" />
            <div className="pt-24 sm:pt-48 lg:pt-64 w-[95vw] sm:w-[90vw] lg:w-[80vw] mx-auto">
                <div className="lg:hidden mb-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full justify-between">
                        Menu
                        <ChevronDown className={cn("h-4 w-4 transition-transform", sidebarOpen && "rotate-180")} />
                    </Button>
                    {sidebarOpen && (
                        <Card className="mt-2">
                            <CardContent className="p-2">
                                {sidebarNav}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="mx-auto w-full flex gap-6">
                    <Card className="w-56 shrink-0 self-start hidden lg:block">
                        <CardContent className="p-2">
                            {sidebarNav}
                        </CardContent>
                    </Card>
                    <Card className="flex-1 min-w-0">

                        <div className='px-3'>
                            <StatsGrid columns={4}>
                                <StatsCard
                                    title="Active Covers"
                                    value={3}
                                    description={`1 expiring soon`}
                                //   icon={Users}
                                //   trend={{ value: dashboardStats.memberGrowth, isPositive: true }}
                                />
                                <StatsCard
                                    title="Total Coverage"
                                    value={30000}
                                    description="Across all policies"
                                // icon={Wallet}
                                // trend={{ value: dashboardStats.savingsGrowth, isPositive: true }}
                                />
                                <StatsCard
                                    title="Monthly Premium"
                                    value={90000}
                                description="Next  Mar 1, 2026"
                                // icon={ShieldCheck}
                                />
                                <StatsCard
                                    title="Claims"
                                    value={0}
                                description={`Monday,23 Feb 2026 . `}
                                // icon={TrendingUp}
                                // trend={{ value: 0.5, isPositive: false }}
                                />
                            </StatsGrid>
                        </div>

                        <CardContent className="sm:p-6">
                            <Outlet />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </main>
    )
}
