import { useState } from "react";
import { useManhwaData } from "@/hooks/useManhwaData";
import { ManhwaGrid } from "./ManhwaGrid";
import { AdminPanel } from "./AdminPanel";
import { EditorModal } from "./EditorModal";
import { GravityStage } from "@/components/gravity/GravityStage";
import { Manhwa } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Grid3x3, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function DeveloperDashboard() {
    const [gravityMode, setGravityMode] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedManhwa, setSelectedManhwa] = useState<Manhwa | undefined>(undefined);

    const { data, isLoading, updateManhwa, addManhwa, deleteManhwa } = useManhwaData();
    const { user, logout } = useAuth();

    const handleCardClick = (item: Manhwa) => {
        setSelectedManhwa(item);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedManhwa(undefined);
        setIsModalOpen(true);
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
        setIsModalOpen(false);
    };

    return (
        <>
            <AdminPanel onAddClick={handleAddNew} />

            <main className="min-h-screen bg-[#0b0d10] text-white lg:pl-20">
                <header className="sticky top-0 z-30 backdrop-blur-xl bg-[#0b0d10]/80 border-b border-white/5">
                    <div className="max-w-[1920px] mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col">
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-primary to-emerald-400 bg-clip-text text-transparent">
                                    IndraScans CMS
                                </h1>
                                <p className="text-xs text-gray-500 font-mono">Developer Panel • {data.length} titles</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
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

                                <span className="relative z-10 font-bold text-sm">
                                    {gravityMode ? "Production Mode" : "Chaos Mode"}
                                </span>
                            </button>

                            <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg">
                                <User className="w-4 h-4 text-primary" />
                                <span className="text-sm text-primary font-medium">Developer</span>
                            </div>

                            <button
                                onClick={logout}
                                className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                <div className="max-w-[1920px] mx-auto p-6">
                    <AnimatePresence mode="wait">
                        {gravityMode ? (
                            <motion.div
                                key="gravity"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <GravityStage data={data} onCardClick={handleCardClick} />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="grid"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <ManhwaGrid data={data} onCardClick={handleCardClick} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <EditorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedManhwa}
                onSave={handleSave}
                onDelete={handleDelete}
            />
        </>
    );
}
