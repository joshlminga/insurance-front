import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-transparent py-6 border-b border-white/10">
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                        <span className="text-white font-bold text-xl italic">A</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white uppercase">Accenture</span>
                </div>

                {/* Centered Menu */}
                <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-white/90">
                    <a href="#home" className="hover:text-red-500 transition-colors uppercase tracking-wider">Home</a>
                    <a href="#about" className="hover:text-red-500 transition-colors uppercase tracking-wider">About</a>
                    <a href="#services" className="hover:text-red-500 transition-colors uppercase tracking-wider">Services</a>
                    <a href="#contact" className="hover:text-red-500 transition-colors uppercase tracking-wider">Contact Us</a>
                </div>

                {/* Login Button */}
                <div className="flex items-center gap-4">
                    <Button className="bg-red-600 hover:bg-red-700 text-white rounded-md px-8 py-6 text-base font-bold" asChild>
                        <Link to="/login">Log In</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}
