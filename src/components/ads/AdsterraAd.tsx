"use client";

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AdsterraAdProps {
    type: 'banner' | 'social_bar' | 'popunder' | 'direct_link';
    hash?: string; // The hash key or Direct Link URL
    width?: number;
    height?: number;
    className?: string;
    onClick?: () => void;
}

export function AdsterraAd({ type, hash, width = 728, height = 90, className, onClick }: AdsterraAdProps) {
    const adRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined' || !hash) return;

        if (type === 'banner') {
            const container = adRef.current;
            if (!container) return;

            // Clear previous content
            container.innerHTML = '';

            const config = document.createElement('script');
            config.type = 'text/javascript';
            config.innerHTML = `
                atOptions = {
                    'key' : '${hash}',
                    'format' : 'iframe',
                    'height' : ${height},
                    'width' : ${width},
                    'params' : {}
                };
            `;

            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = `//www.highperformanceformat.com/${hash}/invoke.js`;

            container.appendChild(config);
            container.appendChild(script);
        } else if (type === 'social_bar' || type === 'popunder') {
            const scriptId = `adsterra-${type}-${hash}`;
            if (document.getElementById(scriptId)) return;

            const script = document.createElement('script');
            script.id = scriptId;
            script.type = 'text/javascript';
            script.async = true;
            // Support the specific format provided by user: https://DOMAIN/62/1b/ac/HASH.js
            // If hash is full 621bac8006c680bccb3a616d1962ae68, path is 62/1b/ac/
            const path = `${hash.substring(0, 2)}/${hash.substring(2, 4)}/${hash.substring(4, 6)}/`;
            script.src = `https://pl28482902.effectivegatecpm.com/${path}${hash}.js`;
            document.body.appendChild(script);
        }
    }, [type, hash]);

    if (type === 'banner') {
        return <div ref={adRef} className={className} />;
    }

    if (type === 'direct_link') {
        return (
            <a
                href={hash}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("absolute inset-0 z-[100] cursor-pointer", className)}
                onClick={onClick}
            />
        );
    }

    return null; // Social bar/Pop-under don't need a visible container
}
