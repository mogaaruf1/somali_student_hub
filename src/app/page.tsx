"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import {
    BookOpen, Users, Cpu, Sparkles, ChevronRight,
    Globe, GraduationCap, Play, Star, ArrowRight
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SearchBar } from "@/components/SearchBar";
import { FeatureCard } from "@/components/FeatureCard";
import { ChatModal } from "@/components/ChatModal";
import { db } from "@/lib/firebase";
import { collection, query, getDocs, where, limit } from "firebase/firestore";
import Link from "next/link";
import staticFeatures from "@/data/features.json";

// Icon mapping
const iconMap: any = { BookOpen, Users, Cpu };

export default function Home() {
    const [features, setFeatures] = useState<any[]>(staticFeatures);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        async function fetchFeatures() {
            console.log("Starting Firestore fetch from 'resources'...");
            try {
                // Try fetching without where condition first to see if collection exists/has data
                const q = query(
                    collection(db, "resources"),
                    limit(6) // Increased limit for diagnostic purposes
                );

                const querySnapshot = await getDocs(q);
                console.log("Query completed. Response size:", querySnapshot.size);

                const data = querySnapshot.docs.map(doc => {
                    const docData = doc.data();
                    // Handle potential case differences (title vs Title, etc.)
                    return {
                        id: doc.id,
                        title: docData.title || docData.Title || "No Title",
                        description: docData.description || docData.Description || "No Description",
                        icon: docData.icon || docData.Icon || "Cpu",
                        color: docData.color || docData.Color || "bg-cyan-500 shadow-cyan-500/20",
                        highlight: docData.highlight || docData.is_featured || false,
                        ...docData // Keep original data as backup
                    } as any;
                });

                if (data && data.length > 0) {
                    console.log("Transformed documents:", data);

                    const mapped = data.map(item => ({
                        ...item,
                        icon: typeof item.icon === 'string' ? (iconMap[item.icon] || Cpu) : item.icon
                    }));
                    setFeatures(mapped);
                } else {
                    console.warn("No documents found in 'resources' collection.");
                }
            } catch (err: any) {
                console.error("Firestore fetch failed:", err);
                console.error("Error code:", err.code);
                console.error("Error message:", err.message);
            }
        }
        fetchFeatures();
    }, []);

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
    };

    return (
        <main className="min-h-screen relative overflow-hidden pb-32 bg-[#000814] text-white selection:bg-cyan-500/30">
            <Navbar />
            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 md:pt-48 pb-20 px-6">
                <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex flex-col items-center gap-8"
                    >
                        <motion.div
                            variants={itemVariants}
                            className="px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm font-semibold flex items-center gap-2 backdrop-blur-sm shadow-[0_0_15px_rgba(34,211,238,0.1)]"
                        >
                            <Sparkles className="w-4 h-4 fill-cyan-400" />
                            <span>Cusub: Firebase Optimized • Masterclass Hub 2026</span>
                        </motion.div>

                        <motion.div variants={itemVariants} className="max-w-5xl px-4">
                            <h1 className="text-6xl md:text-[10rem] font-black tracking-tight leading-[0.9] mb-8">
                                Master the <br />
                                <span className="neon-glow text-cyan-400">Future</span>
                            </h1>
                            <p className="text-xl md:text-3xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light">
                                Ku soo biir kumanaan arday Soomaaliyeed ah. Baro xirfadaha ugu dambeeya adigoo jooga gurigaaga.
                            </p>
                        </motion.div>

                        <motion.div variants={itemVariants} className="w-full mt-4 max-w-3xl px-4">
                            <SearchBar />
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-wrap justify-center gap-6 mt-12">
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="animate-pulse-slow glass-card hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-xl flex items-center gap-4 group shadow-[0_0_40px_rgba(0,255,255,0.2)] ring-1 ring-cyan-500/50"
                            >
                                <Cpu className="w-8 h-8 text-cyan-400 group-hover:rotate-12 transition-transform" />
                                Open AI Tutor <span className="text-cyan-400">⚡</span>
                            </button>

                            <button className="px-5 py-5 text-white/40 hover:text-white transition-all font-semibold flex items-center gap-2">
                                Learn how it works <ChevronRight />
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24 px-6 relative z-10" id="features">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, idx) => (
                            <Link href={`/resource/${feature.id}`} key={feature.id || idx}>
                                <FeatureCard
                                    title={feature.title}
                                    description={feature.description}
                                    icon={typeof feature.icon === 'string' ? (iconMap[feature.icon] || Cpu) : feature.icon}
                                    color={feature.color || "bg-cyan-500 shadow-cyan-500/20"}
                                    delay={0.1 * (idx + 1)}
                                    highlight={feature.highlight}
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- COMMUNITY SECTION --- */}
            <section className="py-24 px-6 relative overflow-hidden" id="community">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="flex-1 space-y-8"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 text-blue-400 text-sm font-bold border border-blue-500/20">
                            <Globe className="w-4 h-4" /> Global Community
                        </div>
                        <h2 className="text-5xl md:text-7xl font-bold leading-tight">
                            Ku biir <span className="text-blue-500">Ardayda</span> <br /> ugu firfircoon.
                        </h2>
                        <p className="text-xl text-white/50 leading-relaxed font-light">
                            Ha u baran kali. Somali Student Hub waa meesha ay isku arkaan hal-abuurada Soomaaliyeed ee dunida daafaheeda jooga.
                        </p>
                        <div className="flex flex-col gap-4">
                            {['Group studies 24/7', 'Weekly networking', 'Expert mentorship'].map((item) => (
                                <div key={item} className="flex items-center gap-3 text-white/80 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/40">
                                        <Star className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                                    </div>
                                    {item}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="flex-1 relative"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full" />
                        <div className="relative glass-card p-4 rounded-[3rem] aspect-square flex items-center justify-center overflow-hidden border-blue-500/30">
                            <img
                                src="https://images.unsplash.com/photo-1522071823991-b9671f9d7f1f?auto=format&fit=crop&q=80&w=800"
                                alt="Community"
                                className="w-full h-full object-cover rounded-[2.5rem] opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                            <div className="absolute inset-x-0 bottom-12 flex justify-center">
                                <button className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-all">
                                    Join Discord <ArrowRight />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* --- STATISTICS SECTION --- */}
            <section className="py-20 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Students", value: "10k+" },
                        { label: "Courses", value: "50+" },
                        { label: "Success Rate", value: "98%" },
                        { label: "Mentors", value: "100+" },
                    ].map((stat, i) => (
                        <div key={i} className="text-center p-8 glass-card rounded-3xl border-white/5 bg-white/[0.01]">
                            <h4 className="text-4xl md:text-5xl font-black text-cyan-400 mb-2">{stat.value}</h4>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* --- HOW IT WORKS --- */}
            <section className="py-24 px-6 relative overflow-hidden" id="how-it-works">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-4xl md:text-6xl font-bold">Sidee u <span className="text-cyan-400">Shaqeeyaa?</span></h2>
                        <p className="text-white/40">Saddex tallaabo oo fudud ayaad ku bilaabi kartaa.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { step: "01", title: "Dooro Koorsada", desc: "Ka hel koorsooyin kugu habboon xirfadda aad doonayso inaad barato." },
                            { step: "02", title: "Is-diiwaangeli", desc: "Buuxi foomka is-diiwaangelinta si aad u hesho fursadaada." },
                            { step: "03", title: "Bilow Barashada", desc: "Ku biir live sessions ama daawo casharrada aad hore u seegtay." },
                        ].map((item, i) => (
                            <div key={i} className="relative p-10 glass-card rounded-[3rem] border-white/5 hover:border-cyan-500/30 transition-all group">
                                <span className="text-8xl font-black text-white/[0.03] absolute top-4 right-8 group-hover:text-cyan-500/10 transition-colors">{item.step}</span>
                                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                                <p className="text-white/50 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- TESTIMONIALS --- */}
            <section className="py-24 px-6 bg-cyan-500/[0.01]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-bold">Maxay leeyihiin <br /> <span className="text-cyan-400">Ardaydaydu?</span></h2>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20">←</div>
                            <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/20">→</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { name: "Abdi Rahman", role: "UI Designer", text: "Somali Student Hub waxay ii fududaysay inaan barto design-ka anigoo jooga Muqdisho." },
                            { name: "Hassan Ali", role: "Web Developer", text: "Casharrada waa kuwo heer sare ah, macallimiintuna waa kuwo aad u khibrad u leh." },
                            { name: "Sahra Yusuf", role: "AI Student", text: "AI Tutor-ka ayaa iga caawiyay inaan fahmo mowduucyo adag 24 saac gudahood." },
                        ].map((t, i) => (
                            <div key={i} className="p-8 glass-card rounded-[2.5rem] bg-white/[0.02] border-white/5 space-y-6">
                                <div className="flex gap-1 text-cyan-400">
                                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-cyan-400" />)}
                                </div>
                                <p className="text-lg italic text-white/60">"{t.text}"</p>
                                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600" />
                                    <div>
                                        <p className="font-bold">{t.name}</p>
                                        <p className="text-xs text-white/40 uppercase font-black">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- MASTERCLASS SECTION --- */}
            <section className="py-24 px-6 bg-white/[0.02]" id="masterclass">
                <div className="max-w-7xl mx-auto text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold border border-cyan-500/20">
                        <GraduationCap className="w-4 h-4" /> Live Masterclasses
                    </div>
                    <h2 className="text-5xl md:text-7xl font-bold">Baro <span className="text-cyan-400">Xirfadaha</span> Lacagta ah.</h2>
                    <p className="text-xl text-white/40 max-w-2xl mx-auto">
                        Koorsooyin live ah oo ay bixinayaan khubaro Soomaaliyeed oo ka shaqeeya shirkadaha ugu waaweyn dunida.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: "UI/UX Mastery", tutor: "Eng. Ahmed", color: "from-purple-500 to-indigo-600", students: "1.2k" },
                        { title: "AI Engineering", tutor: "Dr. Fatima", color: "from-cyan-500 to-blue-600", students: "2.4k" },
                    ].map((course, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group relative h-[400px] rounded-[2.5rem] overflow-hidden border border-white/10"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-20 group-hover:opacity-40 transition-opacity duration-700`} />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                            <div className="relative h-full p-12 flex flex-col justify-end">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-2">
                                        <p className="text-cyan-400 font-bold uppercase tracking-wider text-sm">Instructor: {course.tutor}</p>
                                        <h3 className="text-4xl font-bold">{course.title}</h3>
                                        <p className="text-white/40 font-medium">{course.students} students enrolled</p>
                                    </div>
                                    <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black group-hover:scale-110 transition-transform">
                                        <Play className="w-6 h-6 fill-black" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* --- BACKGROUND DECOR --- */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] -z-10 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[50%] -translate-x-1/2 w-[1000px] h-[1000px] bg-cyan-500/10 blur-[200px] rounded-full" />
                <div className="absolute top-[30%] right-[-20%] w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-purple-500/10 blur-[150px] rounded-full" />
            </div>

            <footer className="mt-20 py-16 border-t border-white/5 text-center">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="mb-8 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                            <span className="text-black font-black text-2xl">S</span>
                        </div>
                        <h4 className="text-2xl font-bold">Somali Student Hub</h4>
                        <p className="text-white/30 max-w-sm">Dhisida jiilka cusub ee aqoonta iyo technology-gada Soomaaliyeed.</p>
                    </div>
                    <p className="text-white/10 text-xs uppercase tracking-widest">© 2026 Somali Student Hub • Masterclass Edition</p>
                </div>
            </footer>
        </main>
    );
}
