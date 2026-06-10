/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { Button } from './ui/button'
import { Bell, Eye } from 'lucide-react'
import { ReusablePopover } from '@/dev/core'
import { SAMPLE_NOTIFS } from '@/utils/constatnts'
import { cn } from '@/lib/utils'

export const NotificationToggle = () => {
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFS);
    const unreadCount = notifications.filter((n) => n.unread).length;
    const markAsRead = (id: any) =>
        setNotifications((prev) =>
            prev.map((notification) =>
                notification.id === id
                    ? { ...notification, unread: false }
                    : notification,
            ),
        );
    const markAllAsRead = () =>
        setNotifications((prev) =>
            prev.map((notification) => ({ ...notification, unread: false })),
        );
    return (
        <ReusablePopover
            trigger={
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600" />
                    <span className="sr-only">Notifications</span>
                </Button>
            }
            children={
                <div className="max-w-96 max-h-96 overflow-hidden mr-10">
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
                        <h3 className="font-medium text-slate-900">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <Button
                                onClick={markAllAsRead}
                                size="sm"
                                variant="outline"
                                className="text-xs border-slate-300 text-slate-700 hover:bg-[#C20C0C]/10 hover:text-[#C20C0C] hover:border-[#C20C0C] transition-colors">
                                Mark all as read
                            </Button>
                        )}
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "flex items-start p-4 border-b border-slate-100 last:border-b-0 transition-colors",
                                    notification.unread
                                        ? "bg-[#C20C0C]/5 hover:bg-[#C20C0C]/10"
                                        : "hover:bg-slate-50"
                                )}>
                                <img
                                    className="w-10 h-10 rounded-full object-cover"
                                    src={notification.avatar}
                                    alt=""
                                />
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {notification.time}
                                    </p>
                                </div>
                                {notification.unread && (
                                    <Button
                                        onClick={() => markAsRead(notification.id)}
                                        size="icon"
                                        variant="ghost"
                                        className=" w-8 h-8 rounded-full text-[#C20C0C] hover:bg-[#C20C0C]/10 hover:text-[#C20C0C] transition-colors">
                                        <span className="w-2 h-2 rounded-full bg-[#C20C0C]" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-t border-slate-200">
                        <button
                            className=" w-full flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-[#C20C0C] transition-colors">
                            <Eye className="w-4 h-4" />
                            View all notifications
                        </button>
                    </div>
                </div>
            }
        />
    )
}
