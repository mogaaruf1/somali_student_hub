"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut, signInWithPopup, GoogleAuthProvider, User } from "firebase/auth";
import { LogOut, User as UserIcon, Menu, X, Rocket, GraduationCap, Globe, LayoutDashboard } from "lucide-react";

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => {
            window.removeEventListener("scroll", handleScroll);
            unsubscribe();
        };
    }, []);

    const handleSignIn = async () => {
        console.log("Sign In button clicked!");
        // alert("Sign In badhanka waa la gujiyay! Hadda waxaa furmaya Google Login...");

        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            console.log("Sign In result:", result.user);
        } catch (error: any) {
            console.error("Error signing in:", error.message);
            alert("Qalad ayaa ka dhacay Sign In-ka: " + error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error: any) {
            console.error("Error signing out:", error.message);
        }
    };

    const navLinks = [
        { name: "Our Features", href: "/#features", icon: Rocket },
        { name: "Community", href: "/#community", icon: Globe },
        { name: "Masterclass", href: "/#masterclass", icon: GraduationCap },
        { name: "Admin", href: "/admin", icon: LayoutDashboard },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
                ? "bg-black/60 backdrop-blur-xl border-b border-white/10 py-4"
                : "bg-transparent py-6"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between relative z-[101]">
                <Link href="/" className="flex items-center gap-2 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-all duration-300">
                        <span className="text-black font-black text-xl">S</span>
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                        Somali Student Hub
                    </span>
                </Link>

                {/* Desktop Links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-white/60 hover:text-cyan-400 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                            <link.icon className="w-4 h-4" />
                            {link.name}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4 relative z-[102]">
                    <div className="hidden md:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link href="/profile" className="flex items-center gap-2 text-white/70 hover:text-cyan-400 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-4 h-4" />
                                        )}
                                    </div>
                                    <span className="text-sm font-medium">{user.displayName || user.email?.split('@')[0]}</span>
                                </Link>
                                <button
                                    onClick={handleSignOut}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/30 hover:text-red-400 cursor-pointer"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleSignIn(); }}
                                    className="text-sm font-medium text-white/70 hover:text-white transition-colors cursor-pointer px-3 py-2"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={(e) => { e.preventDefault(); handleSignIn(); }}
                                    className="px-5 py-2.5 text-sm font-bold rounded-full bg-white text-black hover:bg-cyan-400 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] cursor-pointer"
                                >
                                    Get Started
                                </button>
                            </>
                        )}
                    </div>

                    <button
                        className="md:hidden p-2 text-white/70 hover:text-white"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass-card border-x-0 border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-6 py-8 flex flex-col gap-6">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-white/70 hover:text-cyan-400 flex items-center gap-4"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <link.icon className="w-6 h-6 text-cyan-400" />
                                    {link.name}
                                </Link>
                            ))}
                            <hr className="border-white/5" />
                            {user ? (
                                <div className="flex flex-col gap-4">
                                    <div className="text-sm text-white/40">{user.email}</div>
                                    <button onClick={handleSignOut} className="text-left text-red-400 font-medium">Sign Out</button>
                                </div>
                            ) : (
                                <button
                                    onClick={handleSignIn}
                                    className="w-full py-4 rounded-2xl bg-cyan-500 text-black font-bold"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
