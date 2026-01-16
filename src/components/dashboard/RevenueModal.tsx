import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, DollarSign, TrendingUp, Calendar, ExternalLink, CreditCard, ArrowUpRight } from 'lucide-react';

interface RevenueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function RevenueModal({ isOpen, onClose }: RevenueModalProps) {
    // Mock data - in real app this would come from an API or manual input
    const [revenueData] = useState({
        balance: 145.20,
        today: 12.50,
        yesterday: 10.85,
        lastMonth: 340.00
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-3xl bg-[#16191e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <DollarSign className="w-6 h-6 text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Ad Revenue</h2>
                            <p className="text-sm text-gray-400">Adsterra Earnings Overview</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Main Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Current Balance */}
                        <div className="p-5 bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <DollarSign className="w-20 h-20 text-green-500" />
                            </div>
                            <h3 className="text-sm font-medium text-green-400 mb-1 flex items-center gap-2">
                                <CreditCard className="w-4 h-4" /> Unpaid Balance
                            </h3>
                            <p className="text-4xl font-bold text-white">${revenueData.balance.toFixed(2)}</p>
                            <div className="mt-4 flex items-center gap-2 text-xs text-green-300 bg-green-500/10 px-2 py-1 rounded w-fit">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                Updated just now
                            </div>
                        </div>

                        {/* Today's Earning */}
                        <div className="p-5 bg-[#0b0d10] border border-white/5 rounded-xl">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">Today so far</h3>
                            <p className="text-2xl font-bold text-white">${revenueData.today.toFixed(2)}</p>
                            <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" /> +15% vs yesterday
                            </p>
                        </div>

                        {/* Last Month */}
                        <div className="p-5 bg-[#0b0d10] border border-white/5 rounded-xl">
                            <h3 className="text-sm font-medium text-gray-400 mb-2">Last Month</h3>
                            <p className="text-2xl font-bold text-white">${revenueData.lastMonth.toFixed(2)}</p>
                            <p className="text-xs text-gray-500 mt-2">
                                Paid via Bitcoin
                            </p>
                        </div>
                    </div>

                    {/* Chart Mockup */}
                    <div className="p-5 bg-[#0b0d10] border border-white/5 rounded-xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-200 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" /> Earning History
                            </h3>
                            <select className="bg-white/5 text-xs text-gray-400 border border-white/10 rounded px-2 py-1 outline-none">
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                            </select>
                        </div>

                        {/* CSS-only Bar Chart */}
                        <div className="h-48 flex items-end gap-2 sm:gap-4 px-2">
                            {[12.5, 15.2, 8.4, 22.0, 18.5, 14.2, 12.5].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col justify-end group">
                                    <div
                                        className="w-full bg-green-500/20 group-hover:bg-green-500/40 rounded-t transition-all relative"
                                        style={{ height: `${(val / 25) * 100}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            ${val.toFixed(2)}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-500 text-center mt-2 border-t border-white/5 pt-2">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* External Link */}
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <Calendar className="w-5 h-5 text-orange-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-orange-200">Adsterra Publisher Dashboard</h4>
                                <p className="text-xs text-orange-200/60">View detailed reports, manage codes, and request payments.</p>
                            </div>
                        </div>
                        <a
                            href="https://publishers.adsterra.com/login"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-lg text-sm transition-colors flex items-center gap-2"
                        >
                            Open Dashboard <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
