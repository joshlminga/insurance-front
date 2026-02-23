import { UseAuth } from '@/components/auth-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/dev/core'
import { cn } from '@/lib/utils'
import { myAccounttLinks, sidebarLinks } from '@/utils/constatnts'
import { ongoingCovers } from '@/utils/enums'
import { useState } from 'react'
import { MyCovers } from './covers'


export function MyCoversPage() {
    const [activeTab, setActiveTab] = useState("ongoing")
    const { logout } = UseAuth()
    return (
        <div className="bg-muted/40">
            <div className="mx-auto flex gap-6 px-4 py-6">
                <Card className="w-56 shrink-0 self-start">
                    <CardContent className="p-2">
                        <nav className="space-y-1">
                            {sidebarLinks.map((link) => (
                                <Button
                                    key={link.label}
                                    variant={link.active ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start",
                                        link.active && "font-semibold"
                                    )}>
                                    {link.label}
                                </Button>
                            ))}
                            <Separator className="my-2" />
                            <div className="space-y-1">
                                {myAccounttLinks.map((label) => (
                                    <Button
                                        key={label}
                                        variant="ghost"
                                        className="w-full justify-start text-muted-foreground"
                                    >
                                        {label}
                                    </Button>
                                ))}
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
                        <h1 className="mb-6 text-xl font-semibold">Covers</h1>
                        <Tabs defaultValue='ongoing' className='gap-4'
                            value={activeTab}
                            onValueChange={setActiveTab}>
                             <TabsList className='bg-background rounded-none border-b p-0'>
                                <TabsTrigger value="ongoing" className='bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none'>
                                    Ongoing/Renewed
                                </TabsTrigger>
                                <TabsTrigger value="cancelled"  className='bg-background data-[state=active]:border-primary dark:data-[state=active]:border-primary h-full rounded-none border-0 border-b-2 border-transparent data-[state=active]:shadow-none'>
                                    Cancelled/Rejected
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="ongoing" className="mt-6">
                                {ongoingCovers.map((cover, i) => (
                                    <MyCovers key={`${cover.id}-${i}`} cover={cover} />
                                ))}
                            </TabsContent>
                            <TabsContent value="cancelled" className="mt-6">
                                <div className="py-16 text-center text-muted-foreground text-sm">
                                    No cancelled or returned covers to display.
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}