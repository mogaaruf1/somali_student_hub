"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
    BookOpen, Users, Cpu, ArrowLeft,
    Calendar, Clock, Globe, Shield,
    Play, Download, CheckCircle, Send,
    FileText, Video, Award, Loader2
} from "lucide-react";
import Link from "next/link";

const iconMap: any = { BookOpen, Users, Cpu };

export default function ResourceDetail() {
    const { id } = useParams();
    const [resource, setResource] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [enrollSuccess, setEnrollSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: ""
    });

    useEffect(() => {
        async function fetchResource() {
            if (!id) return;
            try {
                const docRef = doc(db, "resources", id as string);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setResource({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (err) {
                console.error("Error fetching resource:", err);
            } finally {
                setLoading(false);
            }
        }
        fetchResource();
    }, [id]);

    const handleEnroll = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        console.log("Starting enrollment for:", formData);

        try {
            // Save to 'enrollments' collection in Firebase
            const docRef = await addDoc(collection(db, "enrollments"), {
                resourceId: id,
                resourceTitle: resource?.title || resource?.Title || "Unknown",
                studentName: formData.fullName,
                studentEmail: formData.email,
                studentPhone: formData.phone,
                enrolledAt: serverTimestamp(),
                status: "pending"
            });

            console.log("Enrollment successful! Doc ID:", docRef.id);

            // Trigger Email Notification (Internal API)
            try {
                await fetch('/api/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentName: formData.fullName,
                        studentEmail: formData.email,
                        resourceTitle: resource?.title || resource?.Title || "Unknown"
                    })
                });
            } catch (notifyErr) {
                console.warn("Notification failed (non-critical):", notifyErr);
            }

            setEnrollSuccess(true);
            setIsEnrolling(false);
            alert("Hambalyo! Is-diiwaangelintaada waa lagu guulaystay.");
        } catch (err: any) {
            console.error("Firestore Enrollment Error:", err);
            // Show more specific error to the user
            if (err.code === 'permission-denied') {
                alert("Khalad: Firestore Rules ayaa u diidaya in xogta la keydiyo. Fadlan hubi 'Rules' ee Firebase Console.");
            } else {
                alert("Waan ka xunnahay, qalad ayaa dhacay: " + err.message);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000814] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!resource) {
        return (
            <div className="min-h-screen bg-[#000814] text-white flex flex-col items-center justify-center gap-6">
                <h1 className="text-4xl font-bold">Lama helin xogtan</h1>
                <Link href="/" className="text-cyan-400 hover:underline flex items-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Ku laabo bogga hore
                </Link>
            </div>
        );
    }

    const Icon = iconMap[resource.icon || resource.Icon] || Cpu;
    const title = resource.title || resource.Title || "N/A";
    const description = resource.description || resource.Description || "";
    const videoUrl = resource.video_url || resource.VideoUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Default fallback
    const downloadUrl = resource.download_url || resource.DownloadUrl || "#";

    return (
        <main className="min-h-screen bg-[#000814] text-white selection:bg-cyan-500/30 pb-20">
            <Navbar />

            <div className="pt-32 px-6 max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-12"
                >
                    {/* Header/Back Link */}
                    <div className="flex justify-between items-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group">
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Gadaal u laabo
                        </Link>
                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-sm font-bold border border-cyan-500/20">
                            <Award className="w-4 h-4" /> Certified Course
                        </div>
                    </div>

                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="flex items-center gap-6">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${resource.color || "bg-cyan-500 shadow-cyan-500/20"} shadow-2xl shrink-0`}>
                                    <Icon className="w-10 h-10 text-white" />
                                </div>
                                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                                    {title}
                                </h1>
                            </div>
                            <p className="text-xl text-white/50 leading-relaxed font-light">
                                {description}
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">
                                    <Users className="w-4 h-4 text-cyan-400" /> 1.2k Students
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm">
                                    <Clock className="w-4 h-4 text-cyan-400" /> 12 Hours Content
                                </div>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
                                <iframe
                                    className="w-full h-full"
                                    src={videoUrl}
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
                        {/* Main Content Areas */}
                        <div className="lg:col-span-2 space-y-12">
                            {/* Course Details */}
                            <div className="glass-card p-8 rounded-[2.5rem] space-y-8 border-white/5 bg-white/[0.02]">
                                <h3 className="text-3xl font-bold flex items-center gap-3">
                                    <FileText className="w-8 h-8 text-cyan-400" />
                                    Muxu koorsadani ka kooban yahay?
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        "Introduction to the concepts",
                                        "Hands-on practical projects",
                                        "Advanced techniques & tips",
                                        "Final assessment & certificate"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 text-white/70">
                                            <CheckCircle className="w-5 h-5 text-cyan-500 shrink-0" />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Download Section */}
                            <div className="glass-card p-8 rounded-[2.5rem] border-cyan-500/10 bg-cyan-500/5 space-y-6">
                                <h4 className="text-2xl font-bold flex items-center gap-3">
                                    <Download className="w-6 h-6 text-cyan-400" />
                                    Downloads & Resources
                                </h4>
                                <div className="space-y-4">
                                    <a
                                        href={downloadUrl}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-cyan-500/50 hover:bg-black/60 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-cyan-500/20 rounded-xl">
                                                <FileText className="w-6 h-6 text-cyan-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold">Course Syllabus (PDF)</p>
                                                <p className="text-xs text-white/40">2.4 MB • English/Somali</p>
                                            </div>
                                        </div>
                                        <Download className="w-5 h-5 text-white/20 group-hover:text-cyan-400 group-hover:translate-y-1 transition-all" />
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Enrollment Sidebar */}
                        <div className="space-y-8">
                            <AnimatePresence mode="wait">
                                {!isEnrolling && !enrollSuccess ? (
                                    <motion.div
                                        key="enroll-cta"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="glass-card p-10 rounded-[3rem] text-center space-y-8 border-cyan-500/30 bg-cyan-500/5 sticky top-32"
                                    >
                                        <div className="space-y-4">
                                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Enroll Now</h3>
                                            <p className="text-white/60">Fursadan ha dhaafin. Ku biir kumanaan arday kale ah hadda.</p>
                                        </div>
                                        <button
                                            onClick={() => setIsEnrolling(true)}
                                            className="w-full py-6 bg-cyan-500 text-black font-black text-2xl rounded-3xl hover:scale-[1.05] active:scale-95 transition-all shadow-[0_0_50px_rgba(34,211,238,0.4)]"
                                        >
                                            IS QOOR HADDA 🚀
                                        </button>
                                    </motion.div>
                                ) : isEnrolling ? (
                                    <motion.div
                                        key="enroll-form"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="glass-card p-8 rounded-[3rem] border-cyan-500/30 bg-white/5 sticky top-32"
                                    >
                                        <h3 className="text-2xl font-bold mb-6">Foomka Is-diiwaangelinta</h3>
                                        <form onSubmit={handleEnroll} className="space-y-4">
                                            <div>
                                                <label className="text-xs text-white/40 uppercase font-bold mb-1 block">Full Name</label>
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder="Magacaaga oo buuxa"
                                                    value={formData.fullName}
                                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/40 uppercase font-bold mb-1 block">Email Address</label>
                                                <input
                                                    required
                                                    type="email"
                                                    placeholder="Email-kaaga"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-white/40 uppercase font-bold mb-1 block">Phone Number</label>
                                                <input
                                                    required
                                                    type="tel"
                                                    placeholder="Lambarkaaga"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-cyan-500 transition-colors"
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full py-4 bg-cyan-500 text-black font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-all mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isSubmitting ? (
                                                    <>Is-diiwaangelintu way socotaa... <Loader2 className="w-4 h-4 animate-spin" /></>
                                                ) : (
                                                    <>Soo gudbi <Send className="w-4 h-4" /></>
                                                )}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setIsEnrolling(false)}
                                                className="w-full text-white/40 text-sm py-2 hover:text-white transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </form>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="enroll-success"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="glass-card p-10 rounded-[3rem] border-green-500/30 bg-green-500/5 text-center space-y-6 sticky top-32"
                                    >
                                        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                                            <CheckCircle className="w-12 h-12 text-black" />
                                        </div>
                                        <h3 className="text-3xl font-bold">Waa lagu guulaystay!</h3>
                                        <p className="text-white/60">Waad ku mahadsantahay is-diiwaangelintaada. Waxaan kugu soo xiriiri doonaa email-kaaga dhawaan.</p>
                                        <button
                                            onClick={() => setEnrollSuccess(false)}
                                            className="text-cyan-400 hover:underline"
                                        >
                                            Back to details
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/10 blur-[180px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/10 blur-[180px] rounded-full" />
            </div>
        </main>
    );
}
