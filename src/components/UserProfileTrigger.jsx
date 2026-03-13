import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import UserProfileModal from './UserProfileModal';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion'; // Added import for AnimatePresence

export default function UserProfileTrigger() {
    const [user, setUser] = useState(null);
    const [isOpen, setIsOpen] = useState(false); // Renamed showModal to isOpen
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const currentUser = await User.me();
                setUser(currentUser);
            } catch (error) {
                // Not logged in
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleLogin = async () => {
        setLoading(true);
        try {
            await User.login();
        } catch (error) {
            console.error("Login failed", error);
            setLoading(false);
        }
    };
    
    if (loading) {
        return <Button variant="ghost" size="icon" className="text-current hover:bg-white/20"><Loader2 className="w-5 h-5 animate-spin"/></Button>;
    }

    if (!user) {
        return null;
    }

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(true)} // Updated onClick handler
                className="text-current hover:bg-white/20" // Updated className for the button
            >
                <img 
                    src={user?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || user?.email || 'User')}&background=random`} // Updated src with optional chaining and fallback
                    alt="Profile" // Updated alt text
                    className="w-8 h-8 rounded-full object-cover border-2 border-white/20" // Updated className for the image
                />
                <span className="sr-only">User Profile</span> {/* Updated sr-only text */}
            </Button>

            <AnimatePresence>
                {isOpen && ( // Conditional rendering based on isOpen
                    <UserProfileModal
                        isOpen={isOpen} // Pass isOpen prop
                        onClose={() => setIsOpen(false)} // Pass onClose prop
                        user={user}
                    />
                )}
            </AnimatePresence>
        </>
    );
}