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
import { Search, Sparkles, Grid3x3, LogIn, UserPlus, User, LogOut, Heart, X } from "lucide-react";
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
    const [isSearchVisible, setIsSearchVisible] = useState(false);

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
                <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0b0d10]/90 border-b border-white/5 shadow-2xl">
                    <div className="max-w-[1920px] mx-auto px-4 sm:px-6 py-2 sm:py-4 flex flex-col gap-2">
                        {/* Top Row */}
                        <div className="flex items-center justify-between gap-4 h-14 sm:h-20">
                            {/* Logo Area */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="relative w-12 h-12 sm:w-16 sm:h-16 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                                    <Image
                                        src="/logo.png"
                                        alt="IndraScans"
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                                <span className="text-lg sm:text-xl font-black italic tracking-tighter text-white hidden xs:block">
                                    INDRA<span className="text-primary text-xl sm:text-2xl">SCANS</span>
                                </span>
                            </div>

                            {/* Search Bar - Desktop */}
                            <div className="flex-1 max-w-2xl hidden md:block">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Cari manhwa..."
                                        className="w-full pl-12 pr-4 py-3 bg-[#16191e] border border-white/5 rounded-xl focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all text-white placeholder:text-gray-600 shadow-inner"
                                    />
                                </div>
                            </div>

                            {/* Right Actions */}
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                                {/* Mobile Search Toggle */}
                                <button
                                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                                    className="p-2 sm:p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors md:hidden text-gray-400 hover:text-primary"
                                >
                                    <Search className="w-5 h-5" />
                                </button>

                                {/* Mode Toggle - for developers */}
                                {isDeveloper && (
                                    <button
                                        onClick={() => setGravityMode(!gravityMode)}
                                        className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-all md:px-6 md:py-3 md:flex md:items-center md:gap-3"
                                    >
                                        <AnimatePresence mode="wait">
                                            {gravityMode ? (
                                                <Grid3x3 className="w-5 h-5 text-primary" />
                                            ) : (
                                                <Sparkles className="w-5 h-5 text-primary" />
                                            )}
                                        </AnimatePresence>
                                        <span className="hidden md:block text-sm font-bold text-primary">
                                            {gravityMode ? 'Classic View' : 'Chaos Mode'}
                                        </span>
                                    </button>
                                )}

                                {/* Favorites Button */}
                                {!isDeveloper && isAuthenticated && user?.role === 'user' && (
                                    <button
                                        onClick={handleUserViewClick}
                                        className="p-2 sm:p-3 bg-primary/10 border border-primary/20 rounded-xl hover:bg-primary/20 transition-colors md:px-4 md:py-2 md:flex md:items-center md:gap-2 text-primary"
                                    >
                                        <Heart className="w-5 h-5" />
                                        <span className="hidden md:block text-sm font-medium">My Favorites</span>
                                    </button>
                                )}

                                {/* Auth Section */}
                                {!isAuthenticated ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setShowLogin(true)}
                                            className="p-2 text-gray-400 hover:text-white sm:px-4 sm:py-2 sm:text-sm"
                                        >
                                            <LogIn className="w-5 h-5 sm:hidden" />
                                            <span className="hidden sm:inline">Login</span>
                                        </button>
                                        <button
                                            onClick={() => setShowRegister(true)}
                                            className="hidden xs:flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 bg-primary text-black font-bold rounded-lg text-xs sm:text-sm"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Join</span>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary to-emerald-600 flex items-center justify-center font-bold text-black text-xs sm:text-sm">
                                            {user?.email[0].toUpperCase()}
                                        </div>
                                        {isDeveloper && (
                                            <span className="hidden sm:block px-2 py-0.5 text-[10px] bg-primary/20 text-primary rounded-full font-bold">DEV</span>
                                        )}
                                        <button
                                            onClick={logout}
                                            className="p-1 sm:p-2 text-gray-400 hover:text-red-400 transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Mobile Search Row - Expandable */}
                        <AnimatePresence>
                            {isSearchVisible && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="md:hidden overflow-hidden pb-2"
                                >
                                    <div className="relative flex items-center gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" />
                                            <input
                                                type="text"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder="Cari manhwa..."
                                                autoFocus
                                                className="w-full pl-12 pr-4 py-3 bg-[#16191e] border border-primary/30 rounded-xl outline-none text-white text-base shadow-xl placeholder:text-gray-600"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                setIsSearchVisible(false);
                                                setSearchQuery('');
                                            }}
                                            className="p-3 bg-white/5 rounded-xl text-gray-400"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
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

