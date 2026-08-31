import { useSidebar } from '@/components/ui/sidebar';
import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '' }: HTMLAttributes<HTMLImageElement>) {
    let state: 'expanded' | 'collapsed' = 'expanded';

    try {
        const sidebar = useSidebar();
        state = sidebar.state;
    } catch {
        // useSidebar throws when this logo is rendered outside a sidebar
    }
    const src = state === 'collapsed' ? '/logo/logo3.png' : '/logo/logo.png';

    return (
        <img
            src={src}
            alt="App Logo"
            className={`h-8 w-auto object-cover ${className}`}
        />
    );
}
