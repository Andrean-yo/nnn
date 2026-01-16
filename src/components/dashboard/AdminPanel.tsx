import { Plus, LayoutGrid, Settings, Box, BarChart3, Users, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface AdminPanelProps {
    onAddClick: () => void;
    onImportClick?: () => void;
    onStatsClick?: () => void;
    className?: string;
}

export function AdminPanel({ onAddClick, onImportClick, onStatsClick, className }: AdminPanelProps) {
    return (
        <div className={cn("fixed left-0 top-0 h-full w-20 flex flex-col items-center py-6 bg-[#0b0d10] border-r border-white/5 z-40 hidden lg:flex shadow-2xl", className)}>
            {/* Logo */}
            <div className="mb-8 p-3 bg-primary/10 rounded-xl group cursor-pointer hover:bg-primary/20 transition-all">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-emerald-600 group-hover:scale-110 transition-transform shadow-[0_0_15px_-3px_rgba(52,211,153,0.5)]" />
            </div>

            {/* Nav Items */}
            <div className="flex flex-col w-full px-4 gap-6">
                <div className="space-y-4">
                    <button className="group relative p-3 w-full flex justify-center rounded-xl bg-primary/10 text-primary transition-all hover:scale-105 hover:shadow-[0_0_15px_-5px_rgba(52,211,153,0.3)]">
                        <LayoutGrid className="w-6 h-6" />
                        <span className="absolute left-16 bg-[#16191e] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                            Dashboard
                        </span>
                    </button>

                    <button
                        onClick={onStatsClick}
                        className="group relative p-3 w-full flex justify-center rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all hover:scale-105 text-purple-400 bg-purple-500/10"
                    >
                        <BarChart3 className="w-6 h-6" />
                        <span className="absolute left-16 bg-[#16191e] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                            Visitor Stats
                        </span>
                    </button>

                    <button className="group relative p-3 w-full flex justify-center rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all hover:scale-105">
                        <Box className="w-6 h-6" />
                        <span className="absolute left-16 bg-[#16191e] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                            Library
                        </span>
                    </button>

                    <button className="group relative p-3 w-full flex justify-center rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all hover:scale-105">
                        <Users className="w-6 h-6" />
                        <span className="absolute left-16 bg-[#16191e] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                            Users
                        </span>
                    </button>

                    <button className="group relative p-3 w-full flex justify-center rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all hover:scale-105">
                        <Settings className="w-6 h-6" />
                        <span className="absolute left-16 bg-[#16191e] text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-white/10 pointer-events-none">
                            Settings
                        </span>
                    </button>
                </div>
            </div>

            {/* Import & Add Buttons */}
            <div className="mt-auto mb-6 space-y-4">
                {onImportClick && (
                    <button
                        onClick={onImportClick}
                        className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:scale-110 transition-all hover:bg-blue-500/30"
                    >
                        <Download className="w-5 h-5" />
                        <span className="absolute left-16 bg-blue-500 text-white font-bold text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            Import Raw
                        </span>
                    </button>
                )}

                <button
                    onClick={onAddClick}
                    className="group relative w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-emerald-500 text-black hover:scale-110 transition-all shadow-[0_0_20px_-5px_rgba(52,211,153,0.5)]"
                >
                    <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                    <span className="absolute left-16 bg-primary text-black font-bold text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Add New
                    </span>
                </button>
            </div>
        </div>
    );
}
