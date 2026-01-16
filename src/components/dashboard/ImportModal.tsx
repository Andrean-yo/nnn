import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export function ImportModal({ isOpen, onClose, onComplete }: ImportModalProps) {
    const [isImporting, setIsImporting] = useState(false);
    const [progress, setProgress] = useState({ processed: 0, imported: 0, failed: 0, total: 0 });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [limit, setLimit] = useState(50);

    const handleImport = async () => {
        setIsImporting(true);
        setError(null);
        setSuccess(false);
        setProgress({ processed: 0, imported: 0, failed: 0, total: 0 });

        try {
            const response = await fetch('/api/import-manhwa-raw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ limit })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Import failed');
            }

            setProgress(data.results);
            setSuccess(true);

            // Notify parent to refresh data
            setTimeout(() => {
                onComplete();
            }, 1000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsImporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md bg-[#16191e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Download className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Import from Manhwa-Raw</h2>
                                <p className="text-sm text-gray-400">Scrape and import manhwa data</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isImporting}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Limit Input */}
                    {!isImporting && !success && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Number of Manhwa to Import
                            </label>
                            <input
                                type="number"
                                value={limit}
                                onChange={(e) => setLimit(Math.max(1, Math.min(100, parseInt(e.target.value) || 50)))}
                                className="w-full px-4 py-2 bg-[#0b0d10] border border-white/10 rounded-lg text-white focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
                                min="1"
                                max="100"
                            />
                            <p className="text-xs text-gray-500 mt-1">Maximum: 100 manhwa</p>
                        </div>
                    )}

                    {/* Progress */}
                    {isImporting && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                <span className="text-sm text-gray-300">Importing manhwa...</span>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Processed:</span>
                                    <span className="text-white font-medium">{progress.processed} / {progress.total || '?'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Imported:</span>
                                    <span className="text-green-400 font-medium">{progress.imported}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Failed:</span>
                                    <span className="text-red-400 font-medium">{progress.failed}</span>
                                </div>
                            </div>

                            <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
                                    style={{ width: progress.total ? `${(progress.processed / progress.total) * 100}%` : '0%' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Success */}
                    {success && !isImporting && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                                <div>
                                    <p className="text-sm font-medium text-green-400">Import Complete!</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        Successfully imported {progress.imported} manhwa
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <div>
                                <p className="text-sm font-medium text-red-400">Import Failed</p>
                                <p className="text-xs text-gray-400 mt-1">{error}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isImporting}
                        className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                    >
                        {success ? 'Close' : 'Cancel'}
                    </button>
                    {!success && (
                        <button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    Start Import
                                </>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
