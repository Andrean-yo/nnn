import { Manhwa } from '@/types';
import { ManhwaCard } from './ManhwaCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ManhwaGridProps {
    data: Manhwa[];
    onCardClick?: (item: Manhwa) => void;
}

export function ManhwaGrid({ data, onCardClick }: ManhwaGridProps) {
    return (
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
            <AnimatePresence>
                {data.map((item) => (
                    <motion.div
                        key={item.id}
                        layoutId={`card-${item.id}`} // Important for shared element transition if we tackle that
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ManhwaCard
                            data={item}
                            onClick={() => onCardClick?.(item)}
                        />
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
