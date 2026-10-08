import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, BookX } from 'lucide-react';
import { MAGAZINE_PALETTE as P } from '@/components/magazine/magazineConfig';
import IssueOpening from '@/components/magazine/IssueOpening';
import CinematicFlipbook from '@/components/magazine/CinematicFlipbook';
import SinglePageReader from '@/components/magazine/SinglePageReader';
import PdfViewer from '@/components/magazine/PdfViewer';

export default function MagazineReader() {
  const { issueId } = useParams();
  const [issue, setIssue] = useState(null);
  const [pages, setPages] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [opened, setOpened] = useState(false);
  const [mode, setMode] = useState('flipbook'); // flipbook | single
  const [pdfSignedUrl, setPdfSignedUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  // Load issue and pages
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const issueData = await base44.entities.MagazineIssue.get(issueId);
        setIssue(issueData);
        const pageRes = await base44.entities.MagazinePage.filter(
          { issue_id: issueId, status: 'published' },
          { sort: 'page_number', limit: 200 }
        );
        setPages(pageRes.items || []);

        const articleRes = await base44.entities.MagazineArticle.filter(
          { issue_id: issueId, status: 'published' },
          { sort: 'order', limit: 200 }
        );
        setArticles(articleRes.items || []);

        // If PDF mode, get signed URL
        if (issueData.assembly_mode === 'pdf' && issueData.cover_pdf_uri) {
          try {
            const signed = await base44.integrations.Core.CreateFileSignedUrl({
              file_uri: issueData.cover_pdf_uri,
              expires_in: 3600,
            });
            setPdfSignedUrl(signed.signed_url);
          } catch (e) {
            console.error('Failed to create signed URL', e);
          }
        }
      } catch (e) {
        setError(e.message || 'Failed to load issue');
      } finally {
        setLoading(false);
      }
    };
    if (issueId) load();
  }, [issueId]);

  // Keyboard navigation
  useEffect(() => {
    if (!opened) return;
    const handler = (e) => {
      if (e.key === 'ArrowLeft') {
        // handled by flipbook/single-page internally
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [opened]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: P.navyVoid }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: P.gold }} />
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center" style={{ background: P.navyVoid }}>
        <div>
          <BookX className="w-12 h-12 mx-auto mb-4" style={{ color: P.gold }} />
          <h2 className="text-xl font-serif mb-2" style={{ color: P.cream }}>Issue not found</h2>
          <p className="text-sm" style={{ color: 'rgba(250,248,245,0.5)' }}>
            {error || 'This issue may not be published yet.'}
          </p>
        </div>
      </div>
    );
  }

  // Cinematic opening
  if (!opened) {
    return (
      <IssueOpening
        issue={issue}
        onBegin={() => setOpened(true)}
        onAutoPlay={() => { setOpened(true); setIsPlaying(true); }}
      />
    );
  }

  const isPdf = issue.assembly_mode === 'pdf';

  return (
    <div className="relative">
      {/* Mode toggle */}
      {!isPdf && pages.length > 0 && (
        <div className="fixed top-3 left-1/2 -translate-x-1/2 z-30">
          <div
            className="flex items-center rounded-full p-1 shadow-xl"
            style={{ background: 'rgba(7,15,31,0.85)', border: '1px solid rgba(201,168,124,0.25)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
          >
            <button
              onClick={() => setMode('flipbook')}
              className="px-4 py-1.5 text-xs font-medium rounded-full transition-all"
              style={{
                background: mode === 'flipbook' ? P.gold : 'transparent',
                color: mode === 'flipbook' ? P.navyVoid : P.cream,
              }}
            >
              Flipbook
            </button>
            <button
              onClick={() => setMode('single')}
              className="px-4 py-1.5 text-xs font-medium rounded-full transition-all"
              style={{
                background: mode === 'single' ? P.gold : 'transparent',
                color: mode === 'single' ? P.navyVoid : P.cream,
              }}
            >
              Single Page
            </button>
          </div>
        </div>
      )}

      {/* Reader content */}
      {isPdf ? (
        <PdfViewer issue={issue} signedUrl={pdfSignedUrl} mode={mode} />
      ) : mode === 'flipbook' ? (
        <CinematicFlipbook
          pages={pages}
          articles={articles}
          issue={issue}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          speed={playbackSpeed}
          setSpeed={setPlaybackSpeed}
        />
      ) : (
        <SinglePageReader
          pages={pages}
          articles={articles}
          issue={issue}
          isPlaying={isPlaying}
          setIsPlaying={setIsPlaying}
          speed={playbackSpeed}
          setSpeed={setPlaybackSpeed}
        />
      )}
    </div>
  );
}