import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import {
  B,
  accentValue,
  accentForDiscipline,
  coverUrl as resolveCoverUrl,
} from '@/components/fellow-home/fellowHomeConfig';
import { resolveSpreadOrder } from '@/components/fellow-edition/editionConfig';
import FlipbookReader from '@/components/fellow-edition/FlipbookReader';
import CoverSpread from '@/components/fellow-edition/spreads/CoverSpread';
import MastheadSpread from '@/components/fellow-edition/spreads/MastheadSpread';
import EditorsLetterSpread from '@/components/fellow-edition/spreads/EditorsLetterSpread';
import EightSpread from '@/components/fellow-edition/spreads/EightSpread';
import DispatchesSpread from '@/components/fellow-edition/spreads/DispatchesSpread';
import FlightographySpread from '@/components/fellow-edition/spreads/FlightographySpread';
import DocumentsSpread from '@/components/fellow-edition/spreads/DocumentsSpread';
import ColophonSpread from '@/components/fellow-edition/spreads/ColophonSpread';

const SPREAD_COMPONENTS = {
  cover: CoverSpread,
  masthead: MastheadSpread,
  editors_letter: EditorsLetterSpread,
  the_eight: EightSpread,
  dispatches: DispatchesSpread,
  flightography: FlightographySpread,
  documents: DocumentsSpread,
  colophon: ColophonSpread,
};

// The full-screen magazine reader. Loads the edition, resolves the Fellow's
// nominee + settings, composes the spreads in governed order, and hands
// the pages to the flipbook engine.
export default function FellowEdition() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [edition, setEdition] = useState(null);
  const [nominee, setNominee] = useState(null);
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const ed = await base44.entities.FellowEdition.get(id);
        setEdition(ed);
        const email = ed.fellow_email;
        const [nominees, settingss] = await Promise.all([
          base44.entities.Nominee.filter({ nominee_email: email }, '-created_date', 1),
          base44.entities.FellowProfileSettings.filter({ fellow_email: email }, '-created_date', 1),
        ]);
        setNominee(nominees[0] || null);
        setSettings(settingss[0] || null);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: B.navyDeep }}>
        <div className="w-10 h-10 border-2 rounded-full animate-spin" style={{ borderColor: 'rgba(201,168,124,0.2)', borderTopColor: B.gold }} />
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: B.gold }}>
          TOP 100 · Preparing Edition
        </p>
      </div>
    );
  }

  if (error || !edition) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center" style={{ background: B.navyDeep }}>
        <p className="text-sm mb-4" style={{ color: B.cream }}>This edition could not be found.</p>
        <Link to="/" className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: B.gold }}>
          Return Home
        </Link>
      </div>
    );
  }

  const accent = accentValue(
    edition.domain_accent ||
      settings?.domain_accent ||
      (nominee?.discipline ? accentForDiscipline(nominee.discipline) : 'entrepreneurship')
  );
  const cover = resolveCoverUrl(edition.cover_asset_id || settings?.cover_asset_id);
  const order = resolveSpreadOrder(edition.spread_order, edition.spread_hidden);

  const pages = order.map((key) => {
    const Cmp = SPREAD_COMPONENTS[key];
    if (!Cmp) return null;
    return (
      <Cmp
        key={key}
        edition={edition}
        nominee={nominee}
        settings={settings}
        accent={accent}
        coverUrl={cover}
        fellowEmail={edition.fellow_email}
      />
    );
  });

  return <FlipbookReader pages={pages} accent={accent} editionTitle={edition.edition_title} />;
}