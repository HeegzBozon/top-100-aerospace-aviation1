import LLHero from '@/components/local-legends/LLHero';
import LLWhatThisIs from '@/components/local-legends/LLWhatThisIs';
import LLCategories from '@/components/local-legends/LLCategories';
import LLHowItWorks from '@/components/local-legends/LLHowItWorks';
import LLAffiliation from '@/components/local-legends/LLAffiliation';
import LLFooter from '@/components/local-legends/LLFooter';

export default function LocalLegends() {
  return (
    <div className="min-h-screen sf-pro">
      <LLHero />
      <LLWhatThisIs />
      <LLCategories />
      <LLHowItWorks />
      <LLAffiliation />
      <LLFooter />
    </div>
  );
}