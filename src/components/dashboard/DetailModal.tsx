import { Manhwa, Chapter } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Calendar, BookOpen, User, Tag } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChapterReader } from './ChapterReader';

interface DetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    manhwa?: Manhwa;
}

export function DetailModal({ isOpen, onClose, manhwa }: DetailModalProps) {
    const [readingChapter, setReadingChapter] = useState<Chapter | null>(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    // Restore reading state from URL
    useEffect(() => {
        if (isOpen && manhwa && manhwa.chapters) {
            const chapterId = searchParams.get('chapterId');
            if (chapterId) {
                const chapter = manhwa.chapters.find(c => c.id === chapterId);
                if (chapter) setReadingChapter(chapter);
            }
        }
    }, [isOpen, manhwa, searchParams]);

    if (!isOpen || !manhwa) return null;

    const handleRead = (chapter: Chapter) => {
        setReadingChapter(chapter);
        // Update URL
        const params = new URLSearchParams(searchParams.toString());
        params.set('manhwaId', manhwa.id);
        params.set('chapterId', chapter.id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleCloseReader = () => {
        setReadingChapter(null);
        // Clear chapter from URL but keep manhwa
        const params = new URLSearchParams(searchParams.toString());
        params.delete('chapterId');
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const updateUrlForChapter = (chapter: Chapter) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('chapterId', chapter.id);
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleNextChapter = () => {
        if (!readingChapter || !manhwa.chapters) return;
        const nextChapter = manhwa.chapters.find(c => c.number === readingChapter.number + 1);
        if (nextChapter) {
            setReadingChapter(nextChapter);
            updateUrlForChapter(nextChapter);
        }
    };

    const handlePrevChapter = () => {
        if (!readingChapter || !manhwa.chapters) return;
        const prevChapter = manhwa.chapters.find(c => c.number === readingChapter.number - 1);
        if (prevChapter) {
            setReadingChapter(prevChapter);
            updateUrlForChapter(prevChapter);
        }
    };

    // If reading, only show the Reader
    if (readingChapter) {
        return (
            <ChapterReader
                manhwa={manhwa}
                chapter={readingChapter}
                onClose={handleCloseReader}
                onNextChapter={manhwa.chapters?.some(c => c.number === readingChapter.number + 1) ? handleNextChapter : undefined}
                onPrevChapter={manhwa.chapters?.some(c => c.number === readingChapter.number - 1) ? handlePrevChapter : undefined}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-4xl bg-[#16191e] border border-white/10 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
                <div className="relative h-64 sm:h-80 w-full">
                    <Image
                        src={manhwa.thumbnail}
                        alt={manhwa.title}
                        fill
                        className="object-cover opacity-50 mask-image-gradient"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#16191e] via-[#16191e]/50 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md border border-white/10"
                    >
                        <X className="w-5 h-5 text-gray-200" />
                    </button>

                    <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
                        <div className="relative w-32 h-48 rounded-lg overflow-hidden border-2 border-white/10 shadow-2xl hidden sm:block">
                            <Image
                                src={manhwa.thumbnail}
                                alt={manhwa.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${manhwa.status === 'Ongoing' ? 'bg-primary text-black' : 'bg-blue-500 text-white'
                                    }`}>
                                    {manhwa.status}
                                </span>
                                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-white/10 text-white border border-white/20">
                                    {manhwa.type}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 text-balance shadow-black drop-shadow-lg">
                                {manhwa.title}
                            </h1>
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold text-white">4.9</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <BookOpen className="w-4 h-4" />
                                    <span>Ch. {manhwa.last_chapter}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(manhwa.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-3">Synopsis</h3>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                    {manhwa.description}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-primary" />
                                    Genres
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {manhwa.genres.map(genre => (
                                        <span
                                            key={genre}
                                            className="px-3 py-1.5 text-xs sm:text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:border-primary/50 transition-colors cursor-default"
                                        >
                                            {genre}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-gray-500">Status</span>
                                        <span className="text-white">{manhwa.status}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-gray-500">Type</span>
                                        <span className="text-white">{manhwa.type}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-gray-500">Released</span>
                                        <span className="text-white">2024</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b border-white/5 last:border-0">
                                        <span className="text-gray-500">Author</span>
                                        <span className="text-white">Unknown</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Chapters</h3>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                                    {manhwa.chapters?.map((chapter) => (
                                        <button
                                            key={chapter.id}
                                            onClick={() => handleRead(chapter)}
                                            className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-primary/20 hover:border-primary/50 border border-white/5 transition-all group"
                                        >
                                            <div className="flex flex-col items-start">
                                                <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">{chapter.title}</span>
                                                <span className="text-xs text-gray-500">{new Date(chapter.releasedAt).toLocaleDateString()}</span>
                                            </div>
                                            <span className="text-xs px-2 py-1 bg-white/10 rounded text-gray-300 group-hover:bg-primary group-hover:text-black transition-colors font-bold">READ</span>
                                        </button>
                                    )) || <p className="text-gray-500 text-sm">No chapters available</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
