import DossierSection from './DossierSection';
import DossierEmpty from './DossierEmpty';

// Bio: the one paragraph the rest of the record is read against.
export default function ProfileBio({ nominee }) {
  const bio = nominee?.bio_extended || nominee?.bio || nominee?.description || '';

  return (
    <DossierSection label="Bio" delay={0.4}>
      {bio ? (
        <p className="font-body text-[15px] leading-[1.85] text-editorial-navy/85">{bio}</p>
      ) : (
        <DossierEmpty>No bio yet. Update your record to add one.</DossierEmpty>
      )}
    </DossierSection>
  );
}