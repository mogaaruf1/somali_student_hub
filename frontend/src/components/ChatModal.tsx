"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Cpu, Loader2, Bot, User } from "lucide-react";

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export function ChatModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Asc! Waxaan ahay AI Tutor-kaaga. Sideen kuugu caawin karaa maanta?" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
            const res = await fetch(`${backendUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg })
            });
            const data = await res.json();

            if (data.reply) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
            } else {
                throw new Error("No reply");
            }
        } catch (err) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Waan ka xunnahay, khalad ayaa dhacay. Fadlan hubi API Key-gaaga." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-x-4 bottom-4 md:inset-auto md:right-8 md:bottom-8 md:w-[450px] md:h-[600px] glass-card rounded-[2rem] z-[101] flex flex-col shadow-2xl overflow-hidden border-cyan-500/20"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center animate-pulse">
                                    <Cpu className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">AI Tutor ⚡</h3>
                                    <p className="text-xs text-cyan-400">Online & Ready to Help</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                aria-label="Close chat"
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/40"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth"
                        >
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${msg.role === 'user'
                                        ? 'bg-cyan-500 text-black font-medium text-sm'
                                        : 'bg-white/5 text-white/80 text-sm border border-white/10'
                                        }`}>
                                        {msg.role === 'assistant' && <Bot className="w-4 h-4 mt-0.5 shrink-0" />}
                                        {msg.role === 'user' && <User className="w-4 h-4 mt-0.5 shrink-0" />}
                                        <p>{msg.content}</p>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-4 rounded-2xl flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                                        <span className="text-sm text-white/40">AI-gu waa uu fikirayaa...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-6 border-t border-white/10 bg-white/5">
                            <div className="relative flex items-center gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Su'aashaada halkan ku qor..."
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-cyan-500/50 transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    aria-label="Send message"
                                    className="bg-cyan-500 p-3 rounded-xl text-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
