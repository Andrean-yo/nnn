import { useEffect, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Manhwa } from '@/types';

export function useGravity(data: Manhwa[]) {
    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const runnerRef = useRef<Matter.Runner | null>(null);

    // Map body IDs to Manhwa IDs
    const [bodies, setBodies] = useState<{ id: string, x: number, y: number, angle: number, manhwaId: string }[]>([]);

    useEffect(() => {
        if (!sceneRef.current) return;

        // Init Engine
        const engine = Matter.Engine.create();
        const runner = Matter.Runner.create();

        engineRef.current = engine;
        runnerRef.current = runner;

        const { width, height } = sceneRef.current.getBoundingClientRect();

        // Boundaries
        const wallThickness = 60;
        const ground = Matter.Bodies.rectangle(width / 2, height + wallThickness / 2, width, wallThickness, { isStatic: true });
        const leftWall = Matter.Bodies.rectangle(0 - wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });
        const rightWall = Matter.Bodies.rectangle(width + wallThickness / 2, height / 2, wallThickness, height, { isStatic: true });

        Matter.World.add(engine.world, [ground, leftWall, rightWall]);

        // Mouse Constraint (Dragging)
        const mouse = Matter.Mouse.create(sceneRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Matter.World.add(engine.world, mouseConstraint);

        // Run
        Matter.Runner.run(runner, engine);

        // Update Loop for React State (Sync Physics -> UI)
        // Note: For high perf, usually we refrain from React State on every frame, 
        // but for < 50 items it's acceptable for smoothness in this prototype.
        const updateLoop = () => {
            const newBodies = engine.world.bodies
                .filter(b => !b.isStatic) // Only dynamic bodies (cards)
                .map(b => ({
                    id: b.id.toString(),
                    x: b.position.x,
                    y: b.position.y,
                    angle: b.angle,
                    manhwaId: (b as any).manhwaId
                }));
            setBodies(newBodies);
            requestAnimationFrame(updateLoop);
        };
        const animId = requestAnimationFrame(updateLoop);

        return () => {
            Matter.Runner.stop(runner);
            cancelAnimationFrame(animId);
            Matter.World.clear(engine.world, false);
            Matter.Engine.clear(engine);
        };
    }, []);

    // Add/Remove Bodies when data changes
    useEffect(() => {
        if (!engineRef.current || !sceneRef.current) return;
        const world = engineRef.current.world;
        const { width } = sceneRef.current.getBoundingClientRect();

        // Simple sync strategy: Clear dynamic bodies and recreate (for prototype simplicity)
        // In prod, diffing would be better.
        const existingBodies = world.bodies.filter(b => !b.isStatic && (b.label !== 'Mouse Constraint'));
        Matter.World.remove(world, existingBodies);

        const newBodies = data.map((item, i) => {
            const x = Math.random() * (width - 100) + 50;
            const y = -Math.random() * 500 - 100; // Start above screen
            const body = Matter.Bodies.rectangle(x, y, 200, 280, { // Approx card size
                chamfer: { radius: 10 },
                restitution: 0.5, // Bouncy
                friction: 0.1,
                density: 0.002
            });
            (body as any).manhwaId = item.id;
            return body;
        });

        Matter.World.add(world, newBodies);
    }, [data.length]); // Only re-spawn on count change for now

    return { sceneRef, bodies };
}
