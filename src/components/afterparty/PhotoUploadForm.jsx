
import React, { useState } from 'react';
import { User } from '@/entities/User';
import { Photo } from '@/entities/Photo';
import { UploadFile } from '@/integrations/Core';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { X, UploadCloud, Loader2 } from 'lucide-react';

export default function PhotoUploadForm({ onClose, onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false); // Renamed from loading
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false); // New state for successful upload message

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError(''); // Clear error when new file is selected
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a photo to upload.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const user = await User.me(); // Get user details early

      // Upload the file
      const { file_url } = await UploadFile({ file });
      if (!file_url) {
        throw new Error('File upload failed: no URL returned.');
      }

      // Create photo record with pending status for moderation
      await Photo.create({
        image_url: file_url,
        caption: caption.trim() || null, // Trim caption and set to null if empty
        uploader_name: user.full_name || user.email, // Use email if full_name is not available
        uploader_email: user.email,
        status: 'pending' // New status field for moderation
      });

      setUploadSuccess(true); // Indicate success
      onUploadSuccess(); // Call success callback
      
      // Delay closing the modal to allow user to see success message
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.'); // Updated error message
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Upload a Photo</h2>
          <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600" disabled={uploading || uploadSuccess}>
            <X className="w-6 h-6" />
          </button>
        </div>
        {uploadSuccess ? (
          <div className="p-6 text-center space-y-4">
            <p className="text-green-600 text-lg font-semibold">
              Photo uploaded successfully!
            </p>
            <p className="text-gray-700">
              It is now pending moderation and will appear in the gallery shortly.
            </p>
            <Loader2 className="mx-auto h-8 w-8 text-green-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="photo-upload" className="block text-sm font-medium text-gray-700 mb-2">Photo</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  {preview ? (
                    <img src={preview} alt="Preview" className="mx-auto h-32 w-auto object-cover rounded-md" />
                  ) : (
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="photo-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload a file</span>
                      <input 
                        id="photo-upload" 
                        name="photo-upload" 
                        type="file" 
                        className="sr-only" 
                        onChange={handleFileChange} 
                        accept="image/png, image/jpeg, image/gif" 
                        disabled={uploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="caption" className="block text-sm font-medium text-gray-700">Caption</label>
              <Textarea
                id="caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a fun caption!"
                className="mt-1"
                rows={3}
                disabled={uploading}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={uploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={uploading || !file}>
                {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {uploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
