
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OldTimesheetsPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/dashboard/monthly-tracker');
    }, [router]);

    return (
        <div>
            <p>Redirecting...</p>
        </div>
    );
}
