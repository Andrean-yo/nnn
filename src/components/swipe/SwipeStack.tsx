import { useState, useEffect } from 'react';
import { Manhwa } from '@/types';
import { SwipeCard } from './SwipeCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X as XIcon, RotateCcw } from 'lucide-react';

interface SwipeStackProps {
    data: Manhwa[];
    onLike: (manhwa: Manhwa) => void;
    onSkip: (manhwa: Manhwa) => void;
    excludeIds?: string[];
}

export function SwipeStack({ data, onLike, onSkip, excludeIds = [] }: SwipeStackProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState<'left' | 'right' | null>(null);

    // Filter out excluded IDs (favorites)
    const availableData = data.filter(item => !excludeIds.includes(item.id));

    const currentCard = availableData[currentIndex];
    const hasMore = currentIndex < availableData.length;

    const handleSwipeLeft = () => {
        if (currentCard) {
            setDirection('left');
            onSkip(currentCard);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setDirection(null);
            }, 300);
        }
    };

    const handleSwipeRight = () => {
        if (currentCard) {
            setDirection('right');
            onLike(currentCard);
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
                setDirection(null);
            }, 300);
        }
    };

    const handleReset = () => {
        setCurrentIndex(0);
        setDirection(null);
    };

    // Reset when data changes
    useEffect(() => {
        setCurrentIndex(0);
    }, [data.length, excludeIds.length]);

    if (!hasMore || !currentCard) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                >
                    <Heart className="w-12 h-12 text-primary" />
                </motion.div>
                <h3 className="text-2xl font-bold mb-2">No More Manhwa!</h3>
                <p className="text-gray-400 mb-6">
                    You've seen all available manhwa. Check back later for updates!
                </p>
                <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-bold rounded-lg hover:bg-emerald-400 transition-all"
                >
                    <RotateCcw className="w-5 h-5" />
                    <span>Start Over</span>
                </button>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            {/* Card Stack */}
            <div className="relative flex-1 max-w-md mx-auto w-full">
                <div className="relative w-full h-full">
                    <AnimatePresence>
                        {/* Show up to 3 cards in stack */}
                        {availableData.slice(currentIndex, currentIndex + 3).map((manhwa, index) => (
                            <motion.div
                                key={manhwa.id}
                                className="absolute inset-0"
                                initial={{ scale: 1 - index * 0.05, y: index * 10 }}
                                animate={{ scale: 1 - index * 0.05, y: index * 10 }}
                                exit={{
                                    x: direction === 'right' ? 500 : -500,
                                    opacity: 0,
                                    transition: { duration: 0.3 }
                                }}
                                style={{
                                    zIndex: 10 - index,
                                }}
                            >
                                <SwipeCard
                                    manhwa={manhwa}
                                    onSwipeLeft={index === 0 ? handleSwipeLeft : () => { }}
                                    onSwipeRight={index === 0 ? handleSwipeRight : () => { }}
                                    isTop={index === 0}
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-6 py-6">
                <button
                    onClick={handleSwipeLeft}
                    className="group w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500 transition-all hover:scale-110"
                >
                    <XIcon className="w-8 h-8 text-red-500" />
                </button>

                <div className="text-center">
                    <p className="text-sm text-gray-400">
                        {currentIndex + 1} / {availableData.length}
                    </p>
                </div>

                <button
                    onClick={handleSwipeRight}
                    className="group w-16 h-16 flex items-center justify-center rounded-full bg-white/5 border-2 border-green-500/50 hover:bg-green-500/10 hover:border-green-500 transition-all hover:scale-110"
                >
                    <Heart className="w-8 h-8 text-green-500" />
                </button>
            </div>
        </div>
    );
}
