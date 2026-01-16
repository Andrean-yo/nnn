import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Download, CheckCircle, AlertCircle, Loader2, Wand2, Link } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

interface ManhwaData {
    title: string;
    description: string;
    thumbnail: string;
    lastChapter: number;
    baseUrl: string;
}

export function ImportModal({ isOpen, onClose, onComplete }: ImportModalProps) {
    const [url, setUrl] = useState('');
    const [isDetecting, setIsDetecting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [manhwaData, setManhwaData] = useState<ManhwaData | null>(null);
    const [chapterFrom, setChapterFrom] = useState(1);
    const [chapterTo, setChapterTo] = useState(1);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleDetect = async () => {
        if (!url) {
            setError('Masukkan URL manhwa terlebih dahulu');
            return;
        }

        setIsDetecting(true);
        setError(null);
        setManhwaData(null);

        try {
            // First, scrape manhwa details
            const scrapeRes = await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const scrapeData = await scrapeRes.json();
            if (!scrapeRes.ok) throw new Error(scrapeData.error || 'Failed to scrape manhwa');

            // Then, detect chapters
            const detectRes = await fetch('/api/detect-chapters', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const detectData = await detectRes.json();
            if (!detectRes.ok) throw new Error(detectData.error || 'Failed to detect chapters');

            const lastChapter = detectData.lastChapter || 1;

            setManhwaData({
                title: scrapeData.title || 'Unknown Title',
                description: scrapeData.description || '',
                thumbnail: scrapeData.thumbnail || '',
                lastChapter,
                baseUrl: url.replace(/\/$/, '')
            });

            setChapterFrom(1);
            setChapterTo(lastChapter);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsDetecting(false);
        }
    };

    const handleImport = async () => {
        if (!manhwaData) return;

        setIsImporting(true);
        setError(null);

        try {
            // Generate chapter URLs
            const chapters = [];
            for (let i = chapterFrom; i <= chapterTo; i++) {
                chapters.push({
                    id: `import-${Date.now()}-${i}`,
                    number: i,
                    title: `Chapter ${i}`,
                    releasedAt: new Date().toISOString(),
                    contentUrl: `${manhwaData.baseUrl}/chapter-${i}/`,
                    fileName: 'Imported Link'
                });
            }

            // Insert manhwa to database
            const { data: insertedManhwa, error: manhwaError } = await supabase
                .from('manhwas')
                .insert([{
                    title: manhwaData.title,
                    description: manhwaData.description,
                    thumbnail_url: manhwaData.thumbnail,
                    status: 'Ongoing',
                    type: 'Manhwa',
                    genres: [],
                    last_chapter: chapterTo
                }])
                .select()
                .single();

            if (manhwaError) throw manhwaError;

            // Insert chapters
            if (insertedManhwa && chapters.length > 0) {
                const chaptersToInsert = chapters.map(c => ({
                    manhwa_id: insertedManhwa.id,
                    number: c.number,
                    title: c.title,
                    released_at: c.releasedAt,
                    content_url: c.contentUrl
                }));

                const { error: chapterError } = await supabase
                    .from('chapters')
                    .insert(chaptersToInsert);

                if (chapterError) {
                    console.error('Failed to insert chapters:', chapterError);
                }
            }

            setSuccess(true);

            // Notify parent to refresh
            setTimeout(() => {
                onComplete();
            }, 1500);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsImporting(false);
        }
    };

    const handleReset = () => {
        setUrl('');
        setManhwaData(null);
        setError(null);
        setSuccess(false);
        setChapterFrom(1);
        setChapterTo(1);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-lg bg-[#16191e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-lg">
                                <Download className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Quick Import</h2>
                                <p className="text-sm text-gray-400">Import manhwa dengan URL</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            disabled={isImporting}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white disabled:opacity-50"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-5">
                    {/* Success State */}
                    {success ? (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-bold text-green-400">Import Berhasil!</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    {manhwaData?.title} dengan {chapterTo - chapterFrom + 1} chapter
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* URL Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Link className="w-3 h-3" />
                                    URL Manhwa
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        disabled={isDetecting || isImporting || !!manhwaData}
                                        className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-primary/50 outline-none disabled:opacity-50"
                                        placeholder="https://manhwa-raw.net/manga/..."
                                    />
                                    <button
                                        onClick={handleDetect}
                                        disabled={isDetecting || isImporting || !url || !!manhwaData}
                                        className="px-4 py-3 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-lg transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Detect Chapters"
                                    >
                                        {isDetecting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Wand2 className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Manhwa Preview */}
                            {manhwaData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4"
                                >
                                    <div className="flex items-start gap-3">
                                        {manhwaData.thumbnail && (
                                            <img
                                                src={manhwaData.thumbnail}
                                                alt={manhwaData.title}
                                                className="w-16 h-20 object-cover rounded-lg border border-white/10"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-white truncate">{manhwaData.title}</h3>
                                            <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                                                {manhwaData.description || 'No description'}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded">
                                                    {manhwaData.lastChapter} Chapters Detected
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleReset}
                                            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
                                            title="Reset"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Chapter Range */}
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                            Import Chapter Range
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[10px] text-gray-500">From</span>
                                                <input
                                                    type="number"
                                                    value={chapterFrom}
                                                    onChange={(e) => setChapterFrom(Math.max(1, Math.min(parseInt(e.target.value) || 1, chapterTo)))}
                                                    min={1}
                                                    max={chapterTo}
                                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-center font-bold focus:border-primary/50 outline-none"
                                                    title="From Chapter"
                                                />
                                            </div>
                                            <span className="text-gray-500 pt-4">→</span>
                                            <div className="flex-1 space-y-1">
                                                <span className="text-[10px] text-gray-500">To</span>
                                                <input
                                                    type="number"
                                                    value={chapterTo}
                                                    onChange={(e) => setChapterTo(Math.max(chapterFrom, parseInt(e.target.value) || 1))}
                                                    min={chapterFrom}
                                                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-center font-bold focus:border-primary/50 outline-none"
                                                    title="To Chapter"
                                                />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 text-center">
                                            Total: <span className="text-primary font-bold">{chapterTo - chapterFrom + 1}</span> chapter akan diimport
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                                    <p className="text-sm text-red-400">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                        onClick={success ? onClose : handleReset}
                        disabled={isImporting}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-colors disabled:opacity-50"
                    >
                        {success ? 'Close' : manhwaData ? 'Reset' : 'Cancel'}
                    </button>
                    {!success && (
                        <button
                            onClick={handleImport}
                            disabled={isImporting || !manhwaData}
                            className="flex-1 px-4 py-3 bg-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Importing...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="w-4 h-4" />
                                    <span>Import Manhwa</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
