import { useRef } from 'react';
import { Manhwa } from '@/types';
import { useGravity } from '@/hooks/useGravity';
import { ManhwaCard } from '@/components/dashboard/ManhwaCard';
import { motion } from 'framer-motion';

interface GravityStageProps {
    data: Manhwa[];
    onCardClick: (item: Manhwa) => void;
}

export function GravityStage({ data, onCardClick }: GravityStageProps) {
    const { sceneRef, bodies } = useGravity(data);

    return (
        <div
            ref={sceneRef}
            className="relative w-full h-[85vh] overflow-hidden bg-gradient-to-b from-[#0b0d10] to-[#16191e] border border-white/5 rounded-xl shadow-inner cursor-grab active:cursor-grabbing"
        >
            {bodies.map((body) => {
                const item = data.find(d => d.id === body.manhwaId);
                if (!item) return null;

                return (
                    <div
                        key={body.id}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transform: `translate(${body.x - 100}px, ${body.y - 140}px) rotate(${body.angle}rad)`, // Center anchor
                            width: '200px',
                            pointerEvents: 'none' // Let Matter.js MouseConstraint handle input on container
                        }}
                    >
                        <div className="pointer-events-auto" onPointerDown={(e) => e.stopPropagation()}>
                            {/* 
                           Note: e.stopPropagation on pointer down is tricky with Matter MouseConstraint. 
                           Actually we want clicks to pass through if dragging, but register click if short tap.
                           For this V1, we will rely on the fact that dragging works via container, 
                           and we might need a separate click handler mechanism or overlay.
                           
                           Approach: Overlay button for 'Edit'
                         */}

                            <ManhwaCard
                                data={item}
                                className="w-[200px] shadow-2xl pointer-events-none" // Disable interaction inside card to prevent conflict
                            />

                            {/* Interactive Overlay for Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCardClick(item);
                                }}
                                className="absolute top-2 right-2 z-50 p-1 bg-black/50 hover:bg-primary text-white rounded pointer-events-auto"
                            >
                                Edit
                            </button>
                        </div>
                    </div>
                );
            })}

            <div className="absolute top-4 left-4 pointer-events-none text-white/20 font-bold text-4xl select-none">
                CHAOS MODE
            </div>
        </div>
    );
}
