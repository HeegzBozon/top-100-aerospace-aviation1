import ProfileHero from '@/components/profile/essentials/ProfileHero';
import ProfileVerification from '@/components/profile/essentials/ProfileVerification';

// What a visitor reads when the record is opened, held here as a proof rather than a
// form: the masthead and the credential band exactly as they are handed over. The
// words themselves are written in the Data Room, one line above this preview.
const VERIFICATION_LABEL = {
  unverified: 'Unverified record',
  self_verified: 'Self-verified record',
  partially_verified: 'Partially verified record',
  fully_verified: 'Fully verified record',
};

export default function ViewSurface({ account, nominee, settings }) {
  const verificationLabel =
    VERIFICATION_LABEL[nominee?.verified_status] || VERIFICATION_LABEL.unverified;

  return (
    <div className="mt-8 overflow-hidden rounded-[10px] border border-editorial-navy/10 bg-white">
      <ProfileHero
        user={account}
        nominee={nominee}
        settings={settings}
        verificationLabel={verificationLabel}
      />
      <ProfileVerification nominee={nominee} claimStatus={nominee?.claim_status} />
    </div>
  );
}