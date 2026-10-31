import { useEffect, useMemo, useRef } from 'react';
import { BadgeCheck, FileDown, Mail, Mic, PenLine } from 'lucide-react';
import { registerSurfaceEditGroups } from '@/components/shell/surfaceFileMenu';

// The record's own Edit menu.
//
// Edit belongs to the machine — everything a Fellow authors — and a reader standing
// on a record has work of its own in it. For the Fellow that is the way back into
// the editor, the episode they are making, and the dossier taken from the record as
// it stands. For anyone else it is the two things a record is for: writing to the
// person, and claiming the record if it is theirs.
//
// Nothing offered here is read by discovery, ranking, or scoring.
export default function useProfileEditMenu({
  enabled = true,
  isOwner = false,
  onOpenEpisode,
  onDossier,
  onEnquire,
  onRevealClaim,
  claimable = false,
}) {
  const groups = useMemo(() => {
    const items = [];

    if (isOwner) {
      items.push({
        key: 'edit-record',
        label: 'Edit your record',
        hint: 'Identity, verification, and the pages of this book',
        icon: PenLine,
        to: '/record',
      });
      if (onOpenEpisode) {
        items.push({
          key: 'edit-episode',
          label: 'Your episode',
          hint: 'Open one, or pick up the one in production',
          icon: Mic,
          onSelect: onOpenEpisode,
        });
      }
      if (onDossier) {
        items.push({
          key: 'edit-dossier',
          label: 'Take the dossier',
          hint: 'Your record, composed onto one page',
          icon: FileDown,
          onSelect: onDossier,
        });
      }
    } else {
      if (onEnquire) {
        items.push({
          key: 'edit-enquire',
          label: 'Write to this Fellow',
          hint: 'A private enquiry, through the desk',
          icon: Mail,
          onSelect: onEnquire,
        });
      }
      if (claimable && onRevealClaim) {
        items.push({
          key: 'edit-claim',
          label: 'Claim this record',
          hint: 'Take ownership of this profile',
          icon: BadgeCheck,
          onSelect: onRevealClaim,
        });
      }
    }

    return items.length ? [{ key: 'profile-edit', label: isOwner ? 'Your record' : 'This record', items }] : [];
  }, [isOwner, onOpenEpisode, onDossier, onEnquire, onRevealClaim, claimable]);

  const groupsRef = useRef(groups);
  groupsRef.current = groups;

  useEffect(() => {
    if (!enabled) return undefined;
    return registerSurfaceEditGroups(() => groupsRef.current);
  }, [enabled]);
}