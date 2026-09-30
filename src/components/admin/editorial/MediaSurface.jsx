import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FolderOpen, Camera, Upload, ImagePlus } from 'lucide-react';
import AssetManager from '@/components/admin/AssetManager';
import ProfilePhotoDiagnostics from '@/components/admin/ProfilePhotoDiagnostics';
import NomineePhotoUploadWizard from '@/components/admin/NomineePhotoUploadWizard';
import HeadshotUploadWizard from '@/components/admin/HeadshotUploadWizard';

// Consolidated Media surface — the four photo/asset tools merged into one tabbed view.
export default function MediaSurface() {
  const [sub, setSub] = useState('assets');
  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-editorial-copper font-bold">Editorial · Media</p>
        <h2 className="font-heading text-3xl text-editorial-navy mt-1">Media & Photos</h2>
        <p className="text-sm text-editorial-navy/60 mt-1">
          One surface for the asset library, photo diagnostics, and bulk and individual headshot uploads.
        </p>
      </div>
      <Tabs value={sub} onValueChange={setSub}>
        <TabsList className="bg-editorial-cream">
          <TabsTrigger value="assets" className="gap-1.5"><FolderOpen className="w-3.5 h-3.5" /> Asset Library</TabsTrigger>
          <TabsTrigger value="diagnostics" className="gap-1.5"><Camera className="w-3.5 h-3.5" /> Photo Diagnostics</TabsTrigger>
          <TabsTrigger value="bulk" className="gap-1.5"><Upload className="w-3.5 h-3.5" /> Bulk Upload</TabsTrigger>
          <TabsTrigger value="headshots" className="gap-1.5"><ImagePlus className="w-3.5 h-3.5" /> Individual</TabsTrigger>
        </TabsList>
        <TabsContent value="assets" className="mt-4"><AssetManager /></TabsContent>
        <TabsContent value="diagnostics" className="mt-4"><ProfilePhotoDiagnostics /></TabsContent>
        <TabsContent value="bulk" className="mt-4"><NomineePhotoUploadWizard /></TabsContent>
        <TabsContent value="headshots" className="mt-4"><HeadshotUploadWizard /></TabsContent>
      </Tabs>
    </div>
  );
}