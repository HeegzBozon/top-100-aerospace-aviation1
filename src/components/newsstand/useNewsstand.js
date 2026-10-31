import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { chooseWomenIssue } from '@/components/magazine/womenEdition';
import {
  byDateDesc,
  dayLabel,
  firstLine,
} from './newsstandConfig';
import { newsletterNotes } from './newsletterArchive';
import { ARCHIVE_VOLUMES } from '@/components/archive/archiveVolumes';

const rows = (result) => (Array.isArray(result) ? result : result?.items || []);

// A bulletin is stock once it is out. Drafts and queued posts stay behind the counter, and
// an archived one has been pulled; everything else is on the stand.
const isStocked = (bulletin) => {
  if (['draft', 'scheduled', 'archived'].includes(bulletin.status)) return false;
  if (!bulletin.published_date) return true;
  const date = new Date(bulletin.published_date);
  return Number.isNaN(date.getTime()) || date <= new Date();
};

const EMPTY = { loading: true, error: null, issues: [], bulletins: [], nominees: [] };
const WIRE_EMPTY = { loading: true, error: null, items: [], sources: [] };

// The stand's stock: the bound editions and the bulletins — the house's own release notes
// and the writing Fellows file. Two reads in one round trip.
export default function useNewsstand() {
  const [stock, setStock] = useState(EMPTY);
  // The wire is read from the two networks on its own round trip, so a network that is down
  // leaves the rest of the stand standing.
  const [wire, setWire] = useState(WIRE_EMPTY);

  const load = useCallback(() => {
    setStock((prev) => ({ ...prev, loading: true, error: null }));
    return Promise.all([
      // One edition on the rack: the TOP 100 Women edition the house is printing. The same
      // resolver the title screen and the edition's own route use picks it, so the front page
      // and the reader can never disagree about which issue is the live one.
      base44.entities.MagazineIssue.filter({}, { sort: '-created_date', limit: 50 }),
      base44.entities.Bulletin.filter({}, { sort: '-published_date', limit: 80 }),
      // The spotlights are the honorees themselves: each one's own page. Read in name order,
      // so the stand implies no standing of its own.
      base44.entities.Nominee.filter({ status: 'active' }, { sort: 'name', limit: 100 }),
    ])
      .then(([issues, bulletins, nominees]) => {
        const edition = chooseWomenIssue(rows(issues));
        setStock({
          loading: false,
          error: null,
          issues: edition ? [edition] : [],
          bulletins: rows(bulletins),
          nominees: rows(nominees),
        });
      })
      .catch((error) => {
        setStock({
          loading: false,
          error: error?.message || 'The stand could not be read.',
          issues: [],
          bulletins: [],
          nominees: [],
        });
      });
  }, []);

  const loadWire = useCallback(() => {
    setWire((prev) => ({ ...prev, loading: true, error: null }));
    return base44.functions
      .invoke('getSocialFeed', {})
      .then((res) => {
        const data = res?.data || {};
        setWire({
          loading: false,
          error: null,
          items: data.items || [],
          sources: data.sources || [],
        });
      })
      .catch((error) => {
        setWire({
          loading: false,
          error: error?.message || 'The wire could not be read.',
          items: [],
          sources: [],
        });
      });
  }, []);

  useEffect(() => {
    load();
    loadWire();
  }, [load, loadWire]);

  const sections = useMemo(() => {
    // The bound volumes: exactly as many as the archive holds. The live volume wears the
    // cover of the edition being printed now; the rest are set as typographic plates, since
    // a volume of record was never given a cover of its own.
    const liveCover = stock.issues[0]?.cover_image_url || '';
    const volumes = ARCHIVE_VOLUMES.map((volume) => ({
      key: `volume-${volume.seasonId}`,
      rack: 'volumes',
      kicker: volume.note || volume.year,
      title: volume.title,
      subtitle: volume.year,
      foot: volume.volume,
      cover: volume.livePath ? liveCover : '',
      to: volume.livePath || volume.path,
    }));

    // Each honoree, read on their own page.
    const spotlights = stock.nominees
      .filter((nominee) => nominee.name)
      .map((nominee) => ({
        key: `spotlight-${nominee.id}`,
        rack: 'spotlights',
        kicker: [nominee.title, nominee.company].filter(Boolean).join(' · ') || 'Honoree',
        title: nominee.name,
        meta: nominee.country || '',
        teaser: nominee.description || '',
        to: `/profiles/${nominee.id}`,
      }));

    const stocked = stock.bulletins
      .filter(isStocked)
      .sort(byDateDesc('published_date', 'created_date'));

    const asBulletin = (bulletin) => {
      const body = bulletin.rich_body || bulletin.body || '';
      return {
        key: `bulletin-${bulletin.id}`,
        rack: 'release',
        kicker: 'Platform note',
        title: bulletin.title || firstLine(body, 90) || 'Bulletin',
        meta: [bulletin.author_name, dayLabel(bulletin.published_date || bulletin.created_date)]
          .filter(Boolean)
          .join(' · '),
        teaser: bulletin.title ? firstLine(body, 170) : '',
        body,
        html: !!bulletin.rich_body,
        link: bulletin.link || '',
        expandable: true,
      };
    };

    return {
      // A post is set as one line of stock: the source printed above it, its own words below,
      // and the address it goes out from.
      wire: wire.items.map((post) => ({
        key: post.id,
        rack: 'wire',
        kicker: 'LinkedIn',
        title: firstLine(post.text, 220) || 'A photograph',
        meta: [post.account, dayLabel(post.publishedAt)].filter(Boolean).join(' · '),
        mediaUrl: post.mediaUrl,
        href: post.permalink,
      })),
      volumes,
      spotlights,
      // The issues under the house's name: every edition the founder has mailed, newest
      // first, numbered by its own date. The archive is a fixed record, so it is read from the
      // series itself rather than from platform bulletins.
      newsletter: newsletterNotes(),
      // And the notes pinned by the door: what the platform itself shipped.
      release: stocked.filter((bulletin) => bulletin.scope === 'platform').map(asBulletin),
    };
  }, [stock, wire]);

  return { ...stock, sections, wire, reload: load, reloadWire: loadWire };
}