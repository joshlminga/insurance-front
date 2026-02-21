import { useSidebar } from '@/components/ui/sidebar';
import type { HTMLAttributes } from 'react';

export default function AppLogoIcon({ className = '' }: HTMLAttributes<HTMLImageElement>) {
    let state: 'expanded' | 'collapsed' = 'expanded';

    try {
        const sidebar = useSidebar();
        state = sidebar.state;
    } catch (e) {
        console.log(e);
    }
    const src = state === 'collapsed' ? '/logo/logo3.png' : '/logo/logo1.png';

    return (
        <img
            src={src}
            alt="App Logo"
            className={`h-8 w-auto object-cover ${className}`}
        />
    );
}
