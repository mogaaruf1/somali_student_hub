"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Command, Loader2, BookOpen, GraduationCap, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, limit, orderBy, startAt, endAt } from "firebase/firestore";

export function SearchBar() {
    const [queryStr, setQueryStr] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleSearch = async (val: string) => {
        setQueryStr(val);
        if (!val.trim()) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            // Basic Firestore text search simulation (prefix search)
            const q = query(
                collection(db, "resources"),
                orderBy("title"),
                startAt(val),
                endAt(val + "\uf8ff"),
                limit(5)
            );

            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (data.length > 0) {
                setResults(data);
            } else {
                // Fallback for legacy field naming (Title)
                const qFallback = query(
                    collection(db, "resources"),
                    orderBy("Title"),
                    startAt(val),
                    endAt(val + "\uf8ff"),
                    limit(5)
                );
                const snapshotFallback = await getDocs(qFallback);
                const fallbackData = snapshotFallback.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setResults(fallbackData || []);
            }
        } catch (err) {
            console.error("Firebase search failed:", err);
            // Mock results for demo if it fails (e.g. collection doesn't exist yet)
            if (val.toLowerCase().includes("web") || val.toLowerCase().includes("design")) {
                setResults([
                    { title: "UI/UX Masterclass", description: "Learn Figma and Design Systems", type: 'course' },
                    { title: "Modern Web Dev", description: "Next.js 15 & Tailwind CSS", type: 'book' }
                ]);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto z-40">
            <div className={`relative transition-all duration-300 ${isFocused ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-cyan-500/10 blur-2xl transition-all rounded-full opacity-50 group-focus-within:opacity-100" />
                <div className={`relative glass-card rounded-2xl flex items-center p-2 pl-6 gap-3 border-2 transition-all ${isFocused ? 'border-cyan-500/50 bg-white/5' : 'border-white/10'}`}>
                    <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-cyan-400' : 'text-white/30'}`} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={queryStr}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Maxaad rabtaa inaad barato maanta?"
                        className="bg-transparent border-none outline-none flex-1 text-white placeholder:text-white/20 py-3 text-lg"
                    />

                    <AnimatePresence>
                        {queryStr && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => { setQueryStr(""); setResults([]); }}
                                className="p-2 hover:bg-white/10 rounded-lg text-white/30"
                            >
                                <X className="w-4 h-4" />
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/20">
                        <Command className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">K</span>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {(isFocused && (results.length > 0 || isLoading)) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.98 }}
                        className="absolute top-full left-0 right-0 mt-4 glass-card rounded-2xl overflow-hidden border-cyan-500/20 shadow-2xl p-2"
                    >
                        {isLoading && (
                            <div className="p-8 flex flex-col items-center gap-4 text-white/20">
                                <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                                <p className="text-sm font-medium">Baaritaan baa socda...</p>
                            </div>
                        )}

                        {!isLoading && results.map((res: any, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group p-4 rounded-xl hover:bg-white/5 cursor-pointer transition-all flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-cyan-500/30 transition-colors">
                                        {res.type === 'course' ? <GraduationCap className="w-5 h-5 text-cyan-400" /> : <BookOpen className="w-5 h-5 text-purple-400" />}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-bold group-hover:text-cyan-400 transition-colors">{res.title}</h4>
                                        <p className="text-white/40 text-sm">{res.description}</p>
                                    </div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-white/0 group-hover:text-cyan-400 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </motion.div>
                        ))}

                        <div className="p-3 mt-2 border-t border-white/5 flex justify-between items-center text-[10px] text-white/20 font-bold uppercase tracking-widest">
                            <span>{results.length} results found</span>
                            <span className="flex items-center gap-1"><Command className="w-3 h-3" /> + Enter to browse all</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
