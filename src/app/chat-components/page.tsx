import { Button } from '@/dev/core';
import { Send, X } from 'lucide-react';
import React from 'react'

export const ChatIndexPage = ({
    // isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    return (
        <div className="fixed bottom-24 right-6 z-999 w-[380px] animate-in slide-in-from-bottom-4 duration-200">
            <div
                className="bg-white rounded-2xl shadow-[0px_8px_32px_rgba(0,0,0,0.12)] border border-gray-200 overflow-hidden"
                style={{
                    maxHeight: '600px',
                }}>
                <div className="bg-[#BF2031] text-white p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div>
                            <h3 className="font-bold text-xl">Chat Support</h3>
                            <p className="text-xs text-white/80">We're here to help</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20 rounded-full hover:text-white"
                        onClick={() => setIsOpen(false)} >
                        <X size={20}/>
                    </Button>
                </div>
                <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="bg-white rounded-2xl rounded-tl-none p-3 shadow-sm max-w-[80%]">
                                <p className="text-sm text-gray-800">
                                    Hello! How can we assist you today?
                                </p>
                                <span className="text-xs text-gray-400 mt-1 block">Just now</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-gray-200">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Type your message..."
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#BF2031] focus:border-transparent text-sm"
                        />
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-[#BF2031] hover:bg-[#9f1a28]">
                            <Send
                                size={20}
                                color="white"
                            />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
