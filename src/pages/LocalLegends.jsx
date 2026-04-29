import LLHero from '@/components/local-legends/LLHero';
import LLMetrics from '@/components/local-legends/LLMetrics';
import LLShift from '@/components/local-legends/LLShift';
import LLSpotlight from '@/components/local-legends/LLSpotlight';
import LLPricing from '@/components/local-legends/LLPricing';
import LLPillars from '@/components/local-legends/LLPillars';
import LLScaling from '@/components/local-legends/LLScaling';
import LLFooter from '@/components/local-legends/LLFooter';

export default function LocalLegends() {
  return (
    <div className="min-h-screen sf-pro">
      <LLHero />
      <LLMetrics />
      <LLShift />
      <LLSpotlight />
      <LLPricing />
      <LLPillars />
      <LLScaling />
      <LLFooter />
    </div>
  );
}