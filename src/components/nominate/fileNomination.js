import { base44 } from '@/api/base44Client';
import { combineGuidedReason } from './NominateConfig';

export const NOMINATION_SURVEY_ID = '69f45633daacf496cacd8666';

// Filing what the guided hub has already accepted: the survey response first, then the
// intake rows it carries, then the survey's own response counter. The flow, the fields and
// the validation stay in the hub — this writes only what stood on the review page.
export async function fileNomination({ aboutYou, nominations }) {
  const answers = {
    your_name: aboutYou.name,
    your_email: aboutYou.email,
    your_connection: aboutYou.connection,
    women_nominations: nominations.women,
    men_nominations: nominations.men,
    angels_nominations: nominations.angels,
    local_legends_nominations: nominations.local_legends,
  };

  const submission = await base44.entities.SurveyResponse.create({
    survey_id: NOMINATION_SURVEY_ID,
    respondent_email: aboutYou.email,
    respondent_name: aboutYou.name,
    answers,
    completed: true,
  });

  const intakeBase = {
    submission_id: submission.id,
    survey_id: NOMINATION_SURVEY_ID,
    nominator_name: aboutYou.name,
    nominator_email: aboutYou.email,
    nominator_connection: aboutYou.connection,
    source: 'unified_nomination_hub',
    status: 'new',
  };

  const peopleIntakes = [
    ...nominations.women.filter(n => n.name?.trim()).map(n => ({
      ...intakeBase,
      nomination_type: 'women',
      nominee_name: n.name,
      nominee_email: n.email,
      role_org: n.role_org,
      link: n.link,
      location: n.location,
      reason: combineGuidedReason(n),
      share_name: n.share_name,
    })),
    ...nominations.men.filter(n => n.name?.trim()).map(n => ({
      ...intakeBase,
      nomination_type: 'men',
      nominee_name: n.name,
      nominee_email: n.email,
      role_org: n.role_org,
      link: n.link,
      location: n.location,
      reason: combineGuidedReason(n),
      share_name: n.share_name,
    })),
    ...nominations.angels.filter(n => n.name?.trim()).map(n => ({
      ...intakeBase,
      nomination_type: 'angels',
      nominee_name: n.name,
      firm: n.firm,
      link: n.link,
      location: n.location,
      investing_in: n.investing_in,
      reason: n.reason,
      share_name: n.share_name,
    })),
  ];

  const localLegendIntakes = nominations.local_legends.filter(n => n.business_name?.trim()).map(n => ({
    ...intakeBase,
    business_name: n.business_name,
    business_type: n.business_type,
    city: n.city,
    owner_name: n.owner_name,
    link: n.link,
    reason: n.reason,
    share_name: n.share_name,
  }));

  if (peopleIntakes.length) await base44.entities.NominationIntake.bulkCreate(peopleIntakes);
  if (localLegendIntakes.length) await base44.entities.LocalLegendNomination.bulkCreate(localLegendIntakes);

  const surveys = await base44.entities.Survey.filter({ id: NOMINATION_SURVEY_ID });
  if (surveys[0]) {
    await base44.entities.Survey.update(NOMINATION_SURVEY_ID, {
      response_count: (surveys[0].response_count || 0) + 1,
    });
  }
}