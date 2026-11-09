import { base44 } from '@/api/base44Client';
import { combineGuidedReason } from './NominateConfig';

export const NOMINATION_SURVEY_ID = '69f45633daacf496cacd8666';

// A filing the desk would not take, carrying the reason it gave so the flow can answer it
// — a name already filed, too much from one address, or a question before the record opens.
export class NominationBlocked extends Error {
  constructor(data) {
    super(data?.message || 'The nomination could not be filed.');
    this.name = 'NominationBlocked';
    this.code = data?.code || 'error';
    this.token = data?.token;
    this.question = data?.question;
  }
}

// Filing what the guided hub has already accepted. The entries are shaped here, where the
// guided answers live; whether they may be filed at all is the desk's decision, never this
// surface's.
export async function fileNomination({ aboutYou, nominations, challenge = null, meta = {} }) {
  const people = [
    ...nominations.women.filter(n => n.name?.trim()).map(n => ({
      type: 'women',
      nominee_id: n.nominee_id || '',
      nominee_name: n.name,
      nominee_email: n.email,
      role_org: n.role_org,
      link: n.link,
      location: n.location,
      reason: combineGuidedReason(n),
      share_name: n.share_name,
    })),
    ...nominations.men.filter(n => n.name?.trim()).map(n => ({
      type: 'men',
      nominee_id: n.nominee_id || '',
      nominee_name: n.name,
      nominee_email: n.email,
      role_org: n.role_org,
      link: n.link,
      location: n.location,
      reason: combineGuidedReason(n),
      share_name: n.share_name,
    })),
    ...nominations.angels.filter(n => n.name?.trim()).map(n => ({
      type: 'angels',
      nominee_name: n.name,
      firm: n.firm,
      link: n.link,
      location: n.location,
      investing_in: n.investing_in,
      reason: n.reason,
      share_name: n.share_name,
    })),
  ];

  const localLegends = nominations.local_legends.filter(n => n.business_name?.trim()).map(n => ({
    business_name: n.business_name,
    business_type: n.business_type,
    city: n.city,
    owner_name: n.owner_name,
    link: n.link,
    reason: n.reason,
    share_name: n.share_name,
  }));

  const response = await base44.functions.invoke('fileNomination', {
    about: aboutYou,
    people,
    localLegends,
    meta: { ...meta, challenge },
  });

  const data = response?.data || {};
  if (!data.success) throw new NominationBlocked(data);
  return data;
}