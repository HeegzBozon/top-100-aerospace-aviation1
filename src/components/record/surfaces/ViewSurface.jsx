import ProfileHero from '@/components/profile/essentials/ProfileHero';
import ProfileVerification from '@/components/profile/essentials/ProfileVerification';
import VerificationPanel from '@/components/verify/VerificationPanel';
import { labelOf } from '@/components/verify/verificationLadder';

// What a visitor reads when the record is opened, held here as a proof rather than a
// form: the masthead and the credential band exactly as they are handed over. The
// words themselves are written in the Data Room, one line above this preview.
//
// Under the proof sits the work that earns it. The credential is the one thing on a
// record the Fellow cannot simply write, so the desk that confirms it lives here.
export default function ViewSurface({ account, nominee, settings, onReload }) {
  return (
    <>
      <div className="mt-8 overflow-hidden rounded-[10px] border border-editorial-navy/10 bg-white">
        <ProfileHero
          user={account}
          nominee={nominee}
          settings={settings}
          verificationLabel={`${labelOf(nominee)} record`}
        />
        <ProfileVerification nominee={nominee} claimStatus={nominee?.claim_status} />
      </div>
      <VerificationPanel nominee={nominee} onVerified={onReload} />
    </>
  );
}