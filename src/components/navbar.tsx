"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "../../public/logo.png";

const navLinks = [
    { label: "Platform", href: "#platform" },
    { label: "Features", href: "#features" },
    { label: "Auction", href: "/auction" },
    { label: "Ecosystem", href: "#ecosystem" },
    { label: "Finance", href: "#finance" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? "bg-white/80 backdrop-blur-xl border-b border-border shadow-sm"
                : "bg-transparent"
                }`}
        >
            <nav className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between lg:h-20">
                    {/* Logo */}
                    <a href="#" className="flex items-center gap-2.5 group">
                        <Image
                            src={logo}
                            alt="Ledger"
                            width={36}
                            height={36}
                            className="rounded-lg"
                        />
                        <span className="text-xl font-bold tracking-tight text-foreground">
                            LEDGER
                        </span>
                    </a>

                    {/* Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <a
                                key={link.label}
                                href={link.href}
                                className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-primary/5"
                            >
                                {link.label}
                            </a>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="hidden lg:flex items-center gap-3">
                        <a
                            href="#contact"
                            className="px-5 py-2.5 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark transition-all duration-200 shadow-sm"
                        >
                            Request Demo
                        </a>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="lg:hidden p-2 text-muted hover:text-foreground transition-colors"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white/95 backdrop-blur-xl border-b border-border"
                    >
                        <div className="px-6 py-4 space-y-1">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-3 text-sm text-muted hover:text-foreground transition-colors rounded-lg hover:bg-primary/5"
                                >
                                    {link.label}
                                </a>
                            ))}
                            <div className="pt-3 border-t border-border">
                                <a
                                    href="#contact"
                                    onClick={() => setMobileOpen(false)}
                                    className="block w-full px-4 py-3 text-sm font-medium text-center text-white bg-primary rounded-lg"
                                >
                                    Request Demo
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
