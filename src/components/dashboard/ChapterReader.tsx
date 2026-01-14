import { useState, useEffect } from 'react';
import { Manhwa, Chapter } from '@/types';
import { X, ChevronLeft, ChevronRight, Settings, MessageCircle, Share2, Facebook, Twitter } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have utility functions

interface ChapterReaderProps {
    manhwa: Manhwa;
    chapter: Chapter;
    onClose: () => void;
    onNextChapter?: () => void;
    onPrevChapter?: () => void;
}

export function ChapterReader({ manhwa, chapter, onClose, onNextChapter, onPrevChapter }: ChapterReaderProps) {
    const [showHeader, setShowHeader] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Hide header on scroll down, show on scroll up
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                setShowHeader(false);
            } else {
                setShowHeader(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    return (
        <div className="fixed inset-0 z-[60] bg-[#1a1a1a] flex flex-col overflow-y-auto custom-scrollbar">

            {/* Sticky Header */}
            <div className={cn(
                "sticky top-0 z-50 transition-transform duration-300 bg-[#0b0d10] border-b border-white/10 shadow-lg",
                showHeader ? "translate-y-0" : "-translate-y-full"
            )}>
                {/* Top Info Bar */}
                <div className="max-w-5xl mx-auto w-full px-4 py-3 flex items-center justify-between">
                    <div className="flex flex-col">
                        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{manhwa.title}</h1>
                        <span className="text-xs text-gray-600">All chapters are in <span className="text-primary font-bold">{manhwa.title}</span></span>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Social & Tools Bar (Reference Mock) */}
                <div className="bg-[#16191e] border-t border-white/5 py-2">
                    <div className="max-w-5xl mx-auto w-full px-4 flex items-center justify-center gap-4">
                        <span className="px-3 py-1 text-[10px] font-bold bg-[#3b5998] text-white rounded flex items-center gap-1 cursor-pointer hover:opacity-80"><Facebook className="w-3 h-3" /> Facebook</span>
                        <span className="px-3 py-1 text-[10px] font-bold bg-[#1da1f2] text-white rounded flex items-center gap-1 cursor-pointer hover:opacity-80"><Twitter className="w-3 h-3" /> Twitter</span>
                        <span className="px-3 py-1 text-[10px] font-bold bg-[#25d366] text-white rounded flex items-center gap-1 cursor-pointer hover:opacity-80"><Share2 className="w-3 h-3" /> WhatsApp</span>
                    </div>
                </div>

                {/* Navigation Bar */}
                <div className="bg-[#0b0d10] py-3 shadow-md">
                    <div className="max-w-5xl mx-auto w-full px-4 flex items-center justify-between gap-4">
                        <button className="flex-1 max-w-[200px] flex items-center justify-between px-4 py-2 bg-[#16191e] border border-white/10 rounded-lg text-sm text-gray-300 hover:border-primary/50 transition-all">
                            <span>{chapter.title}</span>
                            <span className="text-xs text-gray-500">▼</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={onPrevChapter}
                                disabled={!onPrevChapter}
                                className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Prev
                            </button>
                            <button
                                onClick={onNextChapter}
                                disabled={!onNextChapter}
                                className="px-4 py-2 bg-primary/20 text-primary hover:bg-primary hover:text-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                            >
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 w-full bg-[#1a1a1a] min-h-screen">
                <div className="max-w-4xl mx-auto w-full bg-black min-h-screen shadow-2xl relative">
                    {/* Chapter Title Overlay */}
                    <div className="absolute top-10 left-10 z-10 opacity-50 pointer-events-none">
                        <h2 className="text-6xl font-black text-white/5 uppercase tracking-tighter">{chapter.number}</h2>
                    </div>

                    {/* Content / Image Display */}
                    <div className="flex flex-col items-center justify-center min-h-[50vh] py-20 px-4">
                        {chapter.contentUrl ? (
                            <div className="w-full">
                                {chapter.contentUrl.endsWith('.pdf') ? (
                                    <iframe src={chapter.contentUrl} className="w-full h-screen border-none" />
                                ) : (
                                    <img src={chapter.contentUrl} alt={`Page for ${chapter.title}`} className="w-full h-auto object-contain" />
                                )}
                            </div>
                        ) : (
                            <div className="text-center space-y-4">
                                <div className="p-8 rounded-full bg-white/5 inline-block">
                                    <MessageCircle className="w-12 h-12 text-gray-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-300">No Content Loaded</h3>
                                    <p className="text-gray-500 text-sm mt-1">This chapter has no image file associated with it.</p>
                                </div>
                                <div className="p-4 border border-dashed border-white/10 rounded-lg text-xs text-gray-600 font-mono">
                                    Chapter ID: {chapter.id}<br />
                                    File Name: {chapter.fileName || 'None'}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Promo / Credits */}
                    <div className="py-20 text-center space-y-2 border-t border-white/5 mx-10">
                        <h3 className="text-2xl font-black italic text-gray-700 uppercase">IndraScans</h3>
                        <p className="text-xs text-gray-600">Thanks for reading on IndraScans</p>
                    </div>

                    {/* Bottom Nav */}
                    <div className="flex items-center justify-center gap-4 pb-20">
                        <button
                            onClick={onPrevChapter}
                            disabled={!onPrevChapter}
                            className="px-8 py-3 bg-[#16191e] border border-white/10 text-gray-300 hover:text-primary hover:border-primary transition-all rounded-full font-bold text-sm"
                        >
                            Previous Chapter
                        </button>
                        <button
                            onClick={onNextChapter}
                            disabled={!onNextChapter}
                            className="px-8 py-3 bg-primary text-black hover:bg-emerald-400 transition-all rounded-full font-bold text-sm shadow-[0_0_20px_-5px_rgba(52,211,153,0.3)]"
                        >
                            Next Chapter
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
