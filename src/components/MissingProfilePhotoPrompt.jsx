import { useState } from 'react';
import { User } from '@/entities/User';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function MissingProfilePhotoPrompt({ user, onPhotoUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const { toast } = useToast();

    // Don't show if user has a photo or if dismissed
    if (user?.avatar_url || dismissed) {
        return null;
    }

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast({
                variant: "destructive",
                title: "Invalid File",
                description: "Please upload an image file (JPG, PNG, etc.)",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: "destructive",
                title: "File Too Large",
                description: "Please upload an image smaller than 5MB",
            });
            return;
        }

        setUploading(true);
        try {
            // Upload file
            const { file_url } = await UploadFile({ file });
            
            // Update user profile
            await User.updateMyUserData({ avatar_url: file_url });
            
            toast({
                title: "Profile Photo Updated!",
                description: "Your profile photo has been successfully uploaded.",
            });

            if (onPhotoUploaded) {
                onPhotoUploaded(file_url);
            }
        } catch (error) {
            console.error('Error uploading profile photo:', error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "Could not upload your photo. Please try again.",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 rounded-lg shadow-sm"
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="bg-indigo-100 rounded-full p-3">
                            <Camera className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                                Add Your Profile Photo
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                Make your profile stand out! Upload a professional photo to help others recognize you.
                            </p>
                            <div className="flex gap-2">
                                <label htmlFor="profile-photo-upload">
                                    <Button 
                                        disabled={uploading}
                                        className="bg-indigo-600 hover:bg-indigo-700"
                                        asChild
                                    >
                                        <span>
                                            {uploading ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Upload className="w-4 h-4 mr-2" />
                                            )}
                                            {uploading ? 'Uploading...' : 'Upload Photo'}
                                        </span>
                                    </Button>
                                </label>
                                <input
                                    id="profile-photo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="hidden"
                                />
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setDismissed(true)}
                                    disabled={uploading}
                                >
                                    Maybe Later
                                </Button>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDismissed(true)}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}