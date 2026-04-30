import { mockMessages } from '@/data/dummy-data';
import { Button, ReuseableInput } from '@/dev/core';
import { UseApiMutation } from '@/hooks/hooks';
import { SendMessageSchema } from '@/types/form-schema';
import { SendMessageValues } from '@/types/schema';
import { SubmitResponse, TMessages } from '@/types/types';
import { EMETHODS } from '@/utils/constatnts';
import { extractErrorMessage } from '@/utils/helpers';
import { ShowToast } from '@/utils/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { Send, X } from 'lucide-react';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';

export const ChatIndexPage = ({
    // isOpen,
    setIsOpen,
}: {
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const [messages, setMessages] = useState<TMessages[]>(mockMessages);
    const [message, setMessage] = useState('');

    const form = useForm<SendMessageValues>({
        resolver: zodResolver(SendMessageSchema),
        defaultValues: {
            message: ""
        },
    })

    const submitMutation = UseApiMutation<SubmitResponse, SendMessageValues>({
        url: "motor/tonnage",
        method: EMETHODS.POST,
        mutationOptions: {
            onSuccess: (data) => {
                console.log(data);
                // form.reset()
            },
            onError: (error: unknown) => {
                const message = extractErrorMessage(error)
                ShowToast.error(message || "Submission failed!")
            },
        },
    })

    const onSubmit = (data: SendMessageValues) => {
        submitMutation.mutate(data)
    }

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
                        <X size={20} />
                    </Button>
                </div>
                <div className="h-[400px] overflow-y-auto p-4 bg-gray-50">
                    <div className="space-y-3">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={`p-3 rounded-2xl shadow-sm max-w-[80%] text-sm ${msg.sender === 'user'
                                        ? 'bg-[#BF2031] text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-tl-none'
                                        }`}>
                                    <p>{msg.text}</p>
                                    <span
                                        className={`text-xs mt-1 block ${msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                                            }`}>
                                        {msg.createdAt}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="p-4 bg-white border-t border-gray-200">
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">

                        <ReuseableInput
                            label=''
                            name='message'
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#BF2031] focus:border-transparent text-sm"
                            placeholder="Type your message..."
                            control={form.control}
                        />
                        <Button
                            size="icon"
                            className="h-10 w-10 rounded-full bg-[#BF2031] hover:bg-[#9f1a28]">
                            <Send
                                size={20}
                                color="white"
                            />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
