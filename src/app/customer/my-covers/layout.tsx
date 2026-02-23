import { Navbar } from '@/app/landing/components/navbar'
import { UseAuth } from '@/components/auth-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button, UserMenuPopover } from '@/dev/core'
import { getInitials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createHeroPopoverItems, myAccounttLinks, sidebarLinks } from '@/utils/constatnts'
import { EPREFIX, EROUTES } from '@/utils/enums'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

export function MyCoversLayout() {
    const { isAuthenticated, logout, user } = UseAuth()
    const navigate = useNavigate()
    const location = useLocation()

    const userName = user?.name ?? "User"
    const userEmail = user?.email ?? ""
    const userInitials = getInitials(userName)
    const heroPopoverItems = createHeroPopoverItems(logout)

    return (
        <main className="relative flex flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4 mb-3">
            {isAuthenticated ? (
                <UserMenuPopover
                    className="absolute top-4 right-4 z-10 sm:right-[88px] rounded-full border border-[#C20C0C] bg-white"
                    userInitials={userInitials}
                    userName={userName}
                    userEmail={userEmail}
                    items={heroPopoverItems}
                />
            ) : (
                <Link
                    to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`}
                    className="absolute top-[19px] right-[88px] z-10 flex h-[26px] w-[82px] items-center justify-center rounded-[20px] border border-[#C20C0C] bg-white text-sm font-semibold text-slate-900">
                    Login
                </Link>
            )}

            <Navbar className='bg-[#ADABAB30] w-full h-[175px] rounded-2xl backdrop-blur-[3.379px]' textStyle='text-[#141414]' navTextStyle="text-[#000000]" />
            <div className="pt-64 w-[80vw] mx-auto">

                <div className="mx-auto w-full flex gap-6">
                    <Card className="w-56 shrink-0 self-start">
                        <CardContent className="p-2">
                            <nav className="space-y-1">
                                {sidebarLinks.map((link) => {
                                    const isActive = link.to === `/${location.pathname.split('/').slice(1, 3).join('/')}`
                                        ? location.pathname === link.to || location.pathname === `${link.to}/`
                                        : location.pathname.startsWith(link.to)
                                    return (
                                        <Button
                                            key={link.label}
                                            variant={isActive ? "secondary" : "ghost"}
                                            onClick={() => navigate(link.to)}
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
                                                onClick={() => navigate(link.to)}
                                                className={cn(
                                                    "w-full justify-start text-muted-foreground",
                                                    isActive && "font-semibold text-foreground"
                                                )}
                                            >
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
                        </CardContent>
                    </Card>
                    <Card className="flex-1">
                        <CardContent className="p-6">
                            <Outlet />
                        </CardContent>
                    </Card>
                </div>

            </div>
        </main>
    )
}
