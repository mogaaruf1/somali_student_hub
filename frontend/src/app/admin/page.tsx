"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { Navbar } from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import {
    Users, Calendar, Mail, Phone,
    Trash2, CheckCircle, Clock, Search,
    Download, LayoutDashboard, UserCheck,
    MessageCircle, LogOut, ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- TYPES ---
interface Enrollment {
    id: string;
    studentName: string;
    studentEmail: string;
    studentPhone: string;
    resourceTitle: string;
    resourceId: string;
    status: "pending" | "approved" | "rejected";
    enrolledAt: any; // Firestore Timestamp
}

// --- CONFIG: ADMIN EMAILS ---
const ADMIN_EMAILS = ["muse@gmail.com", "mohamedabdifitah114@gmail.com", "admin@somali-student-hub.com", "Kct@gmail.com"].map(
    (email) => email.toLowerCase()
);

export default function AdminDashboard() {
    const router = useRouter();
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            const email = (currentUser?.email || "").toLowerCase();
            if (currentUser && ADMIN_EMAILS.includes(email)) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        });

        // Real-time listener for enrollments
        const q = query(collection(db, "enrollments"), orderBy("enrolledAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Enrollment));
            setEnrollments(data);
            setLoading(false);
        });

        return () => {
            authUnsubscribe();
            unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push("/"); // Redirect to home page after sign out
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await updateDoc(doc(db, "enrollments", id), { status: newStatus });
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const deleteEnrollment = async (id: string) => {
        if (!confirm("Ma hubtaa inaad tirtirto is-diiwaangelintan?")) return;
        try {
            await deleteDoc(doc(db, "enrollments", id));
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    const exportToCSV = () => {
        const headers = ["ID", "Student Name", "Email", "Phone", "Course", "Status", "Date"];
        const rows = enrollments.map((e: Enrollment) => [
            e.id,
            `"${e.studentName || 'N/A'}"`,
            e.studentEmail,
            e.studentPhone,
            `"${e.resourceTitle || 'N/A'}"`,
            e.status,
            e.enrolledAt?.toDate().toLocaleDateString() || 'N/A'
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map((r: any[]) => r.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `enrollments_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredEnrollments = enrollments.filter(e =>
        e.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.resourceTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000814] flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthorized) {
        return (
            <main className="min-h-screen bg-[#000814] text-white">
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
                    <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                        <ShieldAlert className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-3xl font-bold mb-4">Lama Oggola (Access Denied)</h1>
                    <p className="text-white/40 max-w-sm mb-8">
                        Email-kaaga (<span className="text-cyan-400">{user?.email}</span>) kuma jiro liiska maamulka.
                        Fadlan gal Email-ka saxda ah ama la xiriir Developer-ka.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/" className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all font-bold">
                            Bogga Hore
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                            Sign Out / Ka Bax
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-[#000814] text-white">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4">
                                <LayoutDashboard className="w-10 h-10 text-cyan-400" />
                                Admin Panel
                            </h1>
                            <button
                                onClick={exportToCSV}
                                className="mt-2 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 text-sm font-bold bg-cyan-400/10 px-4 py-2 rounded-xl border border-cyan-400/20 transition-all hover:scale-105"
                            >
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </div>
                        <p className="text-white/40">Logged in as: <span className="text-cyan-400 font-medium">{user?.email}</span></p>
                    </div>

                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search by name or course..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-cyan-500/50 transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: "Total Students", value: enrollments.length, icon: Users, color: "text-blue-400" },
                        { label: "Pending", value: enrollments.filter(e => e.status === "pending").length, icon: Clock, color: "text-yellow-400" },
                        { label: "Approved", value: enrollments.filter(e => e.status === "approved").length, icon: UserCheck, color: "text-green-400" },
                        {
                            label: "System",
                            value: "Sign Out",
                            icon: LogOut,
                            color: "text-red-400",
                            onClick: handleLogout
                        },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            onClick={stat.onClick}
                            className={`glass-card p-6 rounded-3xl border-white/5 bg-white/[0.02] flex items-center justify-between ${stat.onClick ? 'cursor-pointer hover:bg-red-500/5 transition-all' : ''}`}
                        >
                            <div>
                                <p className="text-sm font-bold text-white/40 uppercase tracking-widest leading-none mb-2">{stat.label}</p>
                                <p className={`text-4xl font-black ${stat.onClick ? 'text-xl' : ''}`}>{stat.value}</p>
                            </div>
                            <stat.icon className={`w-12 h-12 ${stat.color} opacity-20`} />
                        </div>
                    ))}
                </div>

                {/* Enrollments Table */}
                <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 bg-white/[0.01]">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-white/5 text-white/40 text-[10px] sm:text-xs uppercase font-black tracking-widest">
                                    <th className="px-8 py-6">Ardayga</th>
                                    <th className="px-8 py-6">Koorsada</th>
                                    <th className="px-8 py-6">Status</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence>
                                    {filteredEnrollments.map((en) => (
                                        <motion.tr
                                            key={en.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
                                                        {en.studentName?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-lg">{en.studentName}</p>
                                                        <p className="text-xs text-white/40 flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            {en.enrolledAt?.toDate().toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
                                                    {en.resourceTitle}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${en.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    en.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {en.status || 'pending'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Contact Actions */}
                                                    <a
                                                        href={`https://wa.me/${en.studentPhone?.replace(/\D/g, '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-3 bg-green-500/10 text-green-500 rounded-xl hover:bg-green-500 hover:text-black transition-all"
                                                        title="WhatsApp"
                                                    >
                                                        <MessageCircle className="w-5 h-5" />
                                                    </a>
                                                    <a
                                                        href={`mailto:${en.studentEmail}`}
                                                        className="p-3 bg-blue-500/10 text-blue-500 rounded-xl hover:bg-blue-500 hover:text-white transition-all"
                                                        title="Email"
                                                    >
                                                        <Mail className="w-5 h-5" />
                                                    </a>

                                                    <div className="w-px h-8 bg-white/10 mx-2" />

                                                    {/* Admin Actions */}
                                                    <button
                                                        onClick={() => updateStatus(en.id, 'approved')}
                                                        className="p-3 bg-white/5 text-white/40 hover:text-green-400 hover:bg-green-400/10 rounded-xl transition-all"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => deleteEnrollment(en.id)}
                                                        className="p-3 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                        {filteredEnrollments.length === 0 && !loading && (
                            <div className="p-20 text-center text-white/20">
                                <Users className="w-16 h-16 mx-auto mb-4 opacity-10" />
                                <p className="text-xl font-bold italic">Wax xog ah lama helin...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-500/5 blur-[120px] rounded-full" />
            </div>
        </main>
    );
}
