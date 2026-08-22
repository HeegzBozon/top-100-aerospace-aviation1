import { useState } from 'react';
import BulletinComposeRail from './BulletinComposeRail';
import BulletinToolTabs from './BulletinToolTabs';
import BulletinComposer from './BulletinComposer';

// The second instrument cluster — the Bulletin Board. Mirrors the masthead
// cluster's 30/70 split: compose rail left, Fellow-authored tools right.
// Sits below identity + verification; never disturbs locked positions.
export default function BulletinBoardCluster({ user, settings, accent, isOwner }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composeType, setComposeType] = useState('note');

  const openComposer = (postType) => {
    if (!postType) return; // tools with null postType (threads) are phase 2
    setComposeType(postType);
    setComposerOpen(true);
  };

  return (
    <section id="bulletin-board" className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="md:flex-[0_0_30%] shrink-0 min-w-0">
          <BulletinComposeRail
            tools={settings?.bulletin_tools}
            accent={accent}
            onCompose={openComposer}
          />
        </div>
        <div className="md:flex-1 min-w-0">
          <BulletinToolTabs
            tools={settings?.bulletin_tools}
            authorEmail={user?.email}
            accent={accent}
            isOwner={isOwner}
          />
        </div>
      </div>

      <BulletinComposer
        open={composerOpen}
        onClose={() => setComposerOpen(false)}
        user={user}
        accent={accent}
        postType={composeType}
      />
    </section>
  );
}