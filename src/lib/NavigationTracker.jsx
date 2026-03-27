import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { base44 } from '@/api/base44Client';

export default function NavigationTracker() {
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    // Post navigation changes to parent window
    useEffect(() => {
        window.parent?.postMessage({
            type: "app_changed_url",
            url: window.location.href
        }, '*');
    }, [location]);

    // Log user activity when navigating to a page
    useEffect(() => {
        const pathname = location.pathname;
        let pageName;
        
        if (pathname === '/' || pathname === '') {
            pageName = 'Home';
        } else {
            pageName = pathname.replace(/^\//, '').split('/')[0];
        }

        if (isAuthenticated && pageName) {
            base44.appLogs.logUserInApp(pageName).catch(() => {});
        }
    }, [location, isAuthenticated]);

    return null;
}