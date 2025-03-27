'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';
import { createBrowserClient } from '@supabase/ssr';

interface ClientSubscriptionCheckProps {
    children: ReactNode;
    redirectTo?: string;
}

export function ClientSubscriptionCheck({
    children,
    redirectTo = '/pricing'
}: ClientSubscriptionCheckProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function checkSubscription() {
            try {
                const supabase = createBrowserClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
                );

                // Get user
                const { data: { user }, error } = await supabase.auth.getUser();
                
                if (error || !user) {
                    console.error("Error fetching user:", error);
                    return router.push('/sign-in');
                }

                // Check subscription status
                try {
                    const response = await fetch('/api/check-subscription', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ userId: user.id }),
                    });
                    
                    const data = await response.json();
                    
                    if (!response.ok || !data.isSubscribed) {
                        return router.push(redirectTo);
                    }
                    
                    setIsSubscribed(true);
                } catch (subError) {
                    console.error("Error checking subscription:", subError);
                    return router.push(redirectTo);
                }
            } finally {
                setIsLoading(false);
            }
        }

        checkSubscription();
    }, [router, redirectTo]);

    // Show loading state
    if (isLoading) {
        return <div className="w-full h-screen flex items-center justify-center">Loading...</div>;
    }

    // Only render children if subscribed
    return isSubscribed ? <>{children}</> : null;
}
