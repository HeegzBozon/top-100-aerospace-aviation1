import { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { base44 } from '@/api/base44Client';
import { Loader2, Download, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import UnifiedProfileEditor from '@/components/dashboard/UnifiedProfileEditor';
import NomineeContributionsSection from '@/components/profile/NomineeContributionsSection';
import NomineeCareerHistorySection from '@/components/profile/NomineeCareerHistorySection';
import NomineeNewsSection from '@/components/profile/NomineeNewsSection';

const brandColors = {
  cream: '#faf8f5',
  navyDeep: '#1e3a5a',
  goldPrestige: '#c9a87c',
};

export default function Profile() {
  const [user, setUser] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);

      // Fetch nominee data if user is nominated
      if (currentUser?.email) {
        try {
          const nominees = await base44.entities.Nominee.filter({ nominee_email: currentUser.email });
          if (nominees?.length > 0) {
            setNominee(nominees[0]);
          }
        } catch (err) {
          console.log('No nominee profile found for user');
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const response = await base44.functions.invoke('exportUserData');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user_data_${user?.email?.replace('@', '_at_') || 'export'}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: brandColors.cream }}>
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: brandColors.goldPrestige }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden sf-pro" style={{ background: brandColors.cream }}>
      <div className="px-3 md:px-6 lg:px-8 py-4 md:py-6 max-w-6xl mx-auto">
        <div className="flex justify-end mb-4">
          <Link
            to={`/profiles/${user?.id}`}
            className="flex items-center gap-2 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: brandColors.navyDeep }}
          >
            <ExternalLink className="w-4 h-4" />
            View Public Profile
          </Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN - Profile Editor */}
          <div className="lg:col-span-2">
            <UnifiedProfileEditor user={user} />
          </div>

          {/* RIGHT COLUMN - Nominee sections */}
          {nominee && (
            <div className="space-y-6">
              <NomineeCareerHistorySection nominee={nominee} />
              <NomineeContributionsSection nomineeId={nominee.id} />
              <NomineeNewsSection nomineeId={nominee.id} />
            </div>
          )}
        </div>

        {/* Data Export - Subtle Link */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleExportData}
            disabled={exporting}
            className="text-xs text-[var(--muted)] hover:text-[var(--text)] transition-colors flex items-center gap-1.5"
          >
            {exporting ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Download className="w-3 h-3" />
            )}
            {exporting ? 'Exporting...' : 'Download my data'}
          </button>
        </div>
      </div>
    </div>
  );
}