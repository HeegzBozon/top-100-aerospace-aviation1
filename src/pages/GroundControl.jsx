import GroundControlHero from '@/components/ground-control/GroundControlHero';
import GroundControlProblem from '@/components/ground-control/GroundControlProblem';
import GroundControlFeatures from '@/components/ground-control/GroundControlFeatures';
import GroundControlPricing from '@/components/ground-control/GroundControlPricing';
import GroundControlScope from '@/components/ground-control/GroundControlScope';
import GroundControlCohort from '@/components/ground-control/GroundControlCohort';
import GroundControlCTA from '@/components/ground-control/GroundControlCTA';

export default function GroundControl() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <GroundControlHero />
      <GroundControlProblem />
      <GroundControlFeatures />
      <GroundControlPricing />
      <GroundControlScope />
      <GroundControlCohort />
      <GroundControlCTA />
    </div>
  );
}