import { cardUrl } from '@/lib/publicCard';
import { EPISODE_TRACK } from '@/components/episode/episodeStages';

// The Media Room is an index over what the Fellow already has, never a second copy of it:
// each entry names the canonical address it points at, and says plainly whether that
// address can be shared yet. Nothing here is edited — the kit, the card and the record are
// edited on their own surfaces, and the room simply holds the way in.

const line = (value) => String(value ?? '').trim();
const origin = () => window.location.origin;

const stageLabel = (status) =>
  EPISODE_TRACK.find((stage) => stage.key === status)?.label || 'Not opened';

export function buildMediaAssets({ nomineeId, kitRow, episode }) {
  const id = line(nomineeId);
  const kitUrl =
    kitRow?.status === 'published' && kitRow?.share_code
      ? `${origin()}/press-kit/${kitRow.share_code}`
      : '';
  const episodeUrl = line(episode?.published_url);

  return [
    {
      key: 'profile',
      label: 'The record',
      note: 'Your profile as the institution holds it: verification, career, The Eight.',
      url: id ? `${origin()}/profiles/${id}` : '',
      ready: !!id,
      blocked: 'Claim your record and its page opens here.',
    },
    {
      key: 'kit',
      label: 'Press kit',
      note: 'The one-page dossier you approved, as a page and a PDF.',
      url: kitUrl,
      ready: !!kitUrl,
      blocked: 'Publish the kit to put it in the room.',
    },
    {
      key: 'card',
      label: 'Business card',
      note: 'The card a contact keeps. It opens without an account.',
      url: id ? cardUrl(id) : '',
      ready: !!id,
      blocked: 'A card is printed from your record once you claim it.',
    },
    {
      key: 'episode',
      label: 'Episode',
      note: episodeUrl
        ? 'The published conversation.'
        : `In production — ${stageLabel(episode?.status)}.`,
      url: episodeUrl,
      ready: !!episodeUrl,
      blocked: 'Share it once the episode is published.',
    },
    {
      key: 'badge',
      label: 'Conference badge',
      note: 'Worn in person. The code on it points at whichever address you choose.',
      tool: true,
      to: '/badge',
      ready: true,
    },
  ];
}

// The public room lists only what the Fellow listed, in the order they listed it.
export const publicRoomItems = (kit) =>
  (Array.isArray(kit?.media_room_public) ? kit.media_room_public : []).filter((row) => row?.url);

export const isListed = (kit, key) =>
  (Array.isArray(kit?.media_room_public) ? kit.media_room_public : []).some((row) => row?.key === key);