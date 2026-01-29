"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    color: string;
    delay?: number;
    highlight?: boolean;
}

export function FeatureCard({ title, description, icon: Icon, color, delay = 0, highlight = false }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className={`group relative glass-card p-8 rounded-[2.5rem] flex flex-col gap-6 h-full ${highlight ? "ring-2 ring-cyan-500/50" : ""
                }`}
        >
            <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-[0_0_20px_rgba(34,211,238,0.2)] ${color}`}
            >
                <Icon className="w-8 h-8 text-white" />
            </div>

            <div className="flex flex-col gap-3">
                <h3 className="text-2xl font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {title}
                </h3>
                <p className="text-white/60 leading-relaxed text-lg">
                    {description}
                </p>
            </div>

            <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-semibold text-white/40 group-hover:text-cyan-400 transition-all">
                Sii soco <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
            </div>

            {/* Decoration background glow */}
            <div className="absolute -z-10 bottom-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] rounded-full group-hover:bg-cyan-500/10 transition-all" />
        </motion.div>
    );
}
