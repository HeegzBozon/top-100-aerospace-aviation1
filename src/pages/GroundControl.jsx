import { useState } from 'react';
import GroundControlHero from '@/components/ground-control/GroundControlHero';
import GroundControlProblem from '@/components/ground-control/GroundControlProblem';
import GroundControlFeatures from '@/components/ground-control/GroundControlFeatures';
import GroundControlPricing from '@/components/ground-control/GroundControlPricing';
import GroundControlScope from '@/components/ground-control/GroundControlScope';
import GroundControlCohort from '@/components/ground-control/GroundControlCohort';
import GroundControlCTA from '@/components/ground-control/GroundControlCTA';
import GroundControlLeadModal from '@/components/ground-control/GroundControlLeadModal';

export default function GroundControl() {
  const [lead, setLead] = useState({ open: false, interestType: 'audit' });
  const openLead = (interestType) => setLead({ open: true, interestType });
  const closeLead = () => setLead((prev) => ({ ...prev, open: false }));

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <GroundControlHero onRequestAudit={() => openLead('audit')} onRequestTrial={() => openLead('trial')} />
      <GroundControlProblem />
      <GroundControlFeatures />
      <GroundControlPricing />
      <GroundControlScope />
      <GroundControlCohort />
      <GroundControlCTA onRequestAudit={() => openLead('audit')} onRequestTrial={() => openLead('trial')} />
      <GroundControlLeadModal open={lead.open} interestType={lead.interestType} onClose={closeLead} />
    </div>
  );
}