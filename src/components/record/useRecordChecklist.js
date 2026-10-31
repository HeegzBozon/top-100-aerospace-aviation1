import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { saveProfileSettings } from '@/functions/saveProfileSettings';
import { preferredNominee, mergedIntoId } from '@/lib/nomineeMerge';
import { useAuth } from '@/lib/AuthContext';
import { buildRecordSurfaces, recordOverall } from './recordChecklist';

const EMPTY = { nominee: null, settings: null, card: null, counts: {} };

// One reading of a Fellow's record, shared by the title screen's keys and the
// workspace itself, so the count on a key and the count inside it always agree.
export default function useRecordChecklist() {
  const { user, isLoadingAuth } = useAuth();
  const email = user?.email || '';
  const [record, setRecord] = useState({ ...EMPTY, account: null, loading: true });
  const cardRef = useRef(null);
  const creating = useRef(null);

  const load = useCallback(async (account) => {
    if (!account?.email) {
      setRecord({ ...EMPTY, account: null, loading: false });
      return;
    }
    setRecord((current) => ({ ...current, loading: true }));

    // One person, one record: the claimed copy outranks a superseded duplicate, and a
    // superseded row resolves to the master it was folded into.
    const rows = await base44.entities.Nominee.filter({ nominee_email: account.email }).catch(() => []);
    let nominee = preferredNominee(rows);
    const masterId = mergedIntoId(nominee || {});
    if (masterId) nominee = (await base44.entities.Nominee.get(masterId).catch(() => nominee)) || nominee;

    const [found, cards, received, answered, attendance] = await Promise.all([
      base44.entities.FellowProfileSettings.filter({ fellow_email: account.email }).catch(() => []),
      base44.entities.FellowBusinessCard.filter({ fellow_email: account.email }).catch(() => []),
      base44.entities.ProfileInquiry.count({ profile_email: account.email }).catch(() => 0),
      base44.entities.ProfileInquiry.count({
        profile_email: account.email,
        status: { $in: ['responded', 'closed'] },
      }).catch(() => 0),
      base44.entities.ConferenceAttendance.count({ fellow_email: account.email }).catch(() => 0),
    ]);

    cardRef.current = cards?.[0] || null;
    creating.current = null;
    setRecord({
      account,
      loading: false,
      nominee: nominee || null,
      settings: found?.[0] || null,
      card: cards?.[0] || null,
      counts: { received: received || 0, answered: answered || 0, attendance: attendance || 0 },
    });
  }, []);

  useEffect(() => {
    if (isLoadingAuth) return;
    load(user);
  }, [isLoadingAuth, email, load]); // eslint-disable-line react-hooks/exhaustive-deps

  // One line of the dossier. The account carries the words, and the two the public
  // record reads are mirrored onto it so both surfaces say the same thing.
  const saveDossier = useCallback(async (field, value) => {
    await base44.auth.updateMe({ [field]: value });
    setRecord((current) => ({ ...current, account: { ...(current.account || {}), [field]: value } }));
    if (field === 'bio' || field === 'six_word_story') {
      const target = record.nominee;
      if (target?.id) {
        await base44.entities.Nominee.update(target.id, { [field]: value }).catch(() => {});
        setRecord((current) => ({ ...current, nominee: { ...(current.nominee || {}), [field]: value } }));
      }
    }
    if (field === 'six_word_story') {
      const res = await saveProfileSettings({ six_word_story: value });
      const settings = res?.data?.settings;
      setRecord((current) => ({
        ...current,
        settings: settings || { ...(current.settings || {}), six_word_story: value },
      }));
    }
  }, [record.nominee]);

  // A curated choice, written through the one function allowed to make it.
  const saveSettings = useCallback(async (patch) => {
    const res = await saveProfileSettings(patch);
    const settings = res?.data?.settings;
    setRecord((current) => ({
      ...current,
      settings: settings || { ...(current.settings || {}), ...patch },
    }));
  }, []);

  // The card is one row per Fellow: it is opened the first time a line is written
  // into it, and every line after that writes to the same row.
  const saveCard = useCallback(async (patch) => {
    if (!email) return;
    let row = cardRef.current;
    if (!row?.id) {
      if (!creating.current) {
        creating.current = base44.entities.FellowBusinessCard.create({ fellow_email: email });
      }
      row = await creating.current;
      creating.current = null;
      cardRef.current = row;
    }
    const updated = await base44.entities.FellowBusinessCard.update(row.id, patch);
    cardRef.current = updated;
    setRecord((current) => ({ ...current, card: updated }));
  }, [email]);

  const surfaces = useMemo(
    () =>
      buildRecordSurfaces({
        user: record.account || user,
        nominee: record.nominee,
        settings: record.settings,
        card: record.card,
        counts: record.counts,
      }),
    [record, user],
  );

  const overall = useMemo(() => recordOverall(surfaces), [surfaces]);

  return {
    loading: record.loading,
    account: record.account,
    nominee: record.nominee,
    settings: record.settings,
    card: record.card,
    counts: record.counts,
    surfaces,
    overall,
    saveDossier,
    saveSettings,
    saveCard,
    // One more reading of the record, for the tools that write it whole — the Studio,
    // the presentation row, an upload that lands on the account.
    reload: () => load(record.account || user),
  };
}