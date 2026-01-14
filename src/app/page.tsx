"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useManhwaData } from "@/hooks/useManhwaData";
import { ManhwaGrid } from "@/components/dashboard/ManhwaGrid";
import { AdminPanel } from "@/components/dashboard/AdminPanel";
import { EditorModal } from "@/components/dashboard/EditorModal";
import { DetailModal } from "@/components/dashboard/DetailModal";
import { GravityStage } from "@/components/gravity/GravityStage";
import { UserView } from "@/components/user/UserView";
import { LoginModal } from "@/components/auth/LoginModal";
import { RegisterModal } from "@/components/auth/RegisterModal";
import { Manhwa } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Grid3x3, LogIn, UserPlus, User, LogOut, Heart } from "lucide-react";
import Image from "next/image";

export default function Home() {
    const [gravityMode, setGravityMode] = useState(false);

    // Split modal states
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const [selectedManhwa, setSelectedManhwa] = useState<Manhwa | undefined>(undefined);
    const [showLogin, setShowLogin] = useState(false);
    const [showRegister, setShowRegister] = useState(false);
    const [showUserView, setShowUserView] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const { data, isLoading, updateManhwa, addManhwa, deleteManhwa } = useManhwaData();
    const { isAuthenticated, user, login, register, logout } = useAuth();

    const filteredData = data.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.genres.some(g => g.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const handleCardClick = (item: Manhwa) => {
        setSelectedManhwa(item);
        if (isDeveloper) {
            setIsEditorOpen(true);
        } else {
            setIsDetailOpen(true);
        }
    };

    const handleAddNew = () => {
        setSelectedManhwa(undefined);
        setIsEditorOpen(true);
    };

    const handleSave = (formData: Partial<Manhwa>) => {
        if (selectedManhwa) {
            updateManhwa({ ...selectedManhwa, ...formData } as Manhwa);
        } else {
            addManhwa(formData as Omit<Manhwa, 'id' | 'updated_at'>);
        }
    };

    const handleDelete = (id: string) => {
        deleteManhwa(id);
        setIsEditorOpen(false);
    };

    const handleUserViewClick = () => {
        if (!isAuthenticated) {
            setShowLogin(true);
        } else if (user?.role === 'user') {
            setShowUserView(true);
        }
    };

    // If user view is active and user is authenticated
    if (showUserView && isAuthenticated && user?.role === 'user') {
        return <UserView onBack={() => setShowUserView(false)} data={data} />;
    }

    // Show developer dashboard if developer is logged in
    const isDeveloper = isAuthenticated && user?.role === 'developer';

    return (
        <>
            {/* Admin Sidebar - only for developers */}
            {isDeveloper && <AdminPanel onAddClick={handleAddNew} />}

            {/* Main Content */}
            <main className={`min-h-screen bg-[#0b0d10] text-white ${isDeveloper ? 'lg:pl-20' : ''}`}>
                {/* Header */}
                <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0b0d10]/80 border-b border-white/5 shadow-2xl shadow-black/50">
                    <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between gap-8 h-20">
                        {/* Logo Area */}
                        <div className="flex items-center gap-4 shrink-0">
                            <div className="relative w-48 h-12">
                                <Image
                                    src="/logo.png"
                                    alt="IndraScans"
                                    fill
                                    className="object-contain object-left"
                                    priority
                                />
                            </div>
                        </div>

                        {/* Search Bar - Center */}
                        <div className="flex-1 max-w-2xl hidden md:block">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search manhwa, genres..."
                                    className="w-full pl-12 pr-4 py-3 bg-[#16191e] border border-white/5 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-white placeholder:text-gray-600 shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4 shrink-0">
                            {/* Mode Toggle - for developers */}
                            {isDeveloper && (
                                <button
                                    onClick={() => setGravityMode(!gravityMode)}
                                    className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary/10 to-emerald-600/10 border border-primary/20 rounded-xl hover:border-primary/50 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                                    <AnimatePresence mode="wait">
                                        {gravityMode ? (
                                            <motion.div
                                                key="grid"
                                                initial={{ rotate: -180, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 180, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="relative z-10"
                                            >
                                                <Grid3x3 className="w-5 h-5 text-primary" />
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="sparkles"
                                                initial={{ rotate: -180, opacity: 0 }}
                                                animate={{ rotate: 0, opacity: 1 }}
                                                exit={{ rotate: 180, opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="relative z-10"
                                            >
                                                <Sparkles className="w-5 h-5 text-primary" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </button>
                            )}

                            {/* User Features Button - for regular users */}
                            {!isDeveloper && isAuthenticated && user?.role === 'user' && (
                                <button
                                    onClick={handleUserViewClick}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                    <Heart className="w-4 h-4 text-primary" />
                                    <span className="text-sm text-primary font-medium">My Favorites</span>
                                </button>
                            )}

                            {/* Auth Buttons */}
                            {!isAuthenticated ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setShowLogin(true)}
                                        className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span className="text-sm">Login</span>
                                    </button>
                                    <button
                                        onClick={() => setShowRegister(true)}
                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-[0_0_15px_-5px_#34d399]"
                                    >
                                        <UserPlus className="w-4 h-4" />
                                        <span className="text-sm">Register</span>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center font-bold text-black text-xs">
                                            {user?.email[0].toUpperCase()}
                                        </div>
                                        <span className="text-sm text-gray-300 hidden xl:block">{user?.email}</span>
                                        {isDeveloper && (
                                            <span className="ml-2 px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full font-bold uppercase tracking-wider">
                                                DEV
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={logout}
                                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                        title="Logout"
                                    >
                                        <LogOut className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="max-w-[1920px] mx-auto p-6">
                    <AnimatePresence mode="wait">
                        {gravityMode && isDeveloper ? (
                            <motion.div
                                key="gravity"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <GravityStage data={filteredData} onCardClick={handleCardClick} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ManhwaGrid data={filteredData} onCardClick={handleCardClick} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            {/* EditorModal - only for developers */}
            {isDeveloper && (
                <EditorModal
                    isOpen={isEditorOpen}
                    onClose={() => setIsEditorOpen(false)}
                    initialData={selectedManhwa}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}

            {/* DetailModal - for everyone */}
            <DetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                manhwa={selectedManhwa}
            />

            {/* Auth Modals */}
            <LoginModal
                isOpen={showLogin}
                onClose={() => setShowLogin(false)}
                onLogin={login}
                onSwitchToRegister={() => {
                    setShowLogin(false);
                    setShowRegister(true);
                }}
            />

            <RegisterModal
                isOpen={showRegister}
                onClose={() => setShowRegister(false)}
                onRegister={register}
                onSwitchToLogin={() => {
                    setShowRegister(false);
                    setShowLogin(true);
                }}
            />
        </>
    );
}

