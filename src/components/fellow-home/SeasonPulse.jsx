import NominationCountdown from '@/components/home-v2/NominationCountdown';
import YearProgressHourglass from '@/components/home-v2/YearProgressHourglass';
import NomineePoolCounter from '@/components/home-v2/NomineePoolCounter';

// Season countdowns + live info from the home surface, restaged for the profile.
// The widgets are navy-glass, so they sit inside a deep-navy panel.
export default function SeasonPulse() {
  return (
    <section className="rounded-3xl p-4 sm:p-6" style={{ background: '#07111f' }}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <NominationCountdown />
        </div>
        <NomineePoolCounter />
      </div>
      <div className="mt-4">
        <YearProgressHourglass />
      </div>
    </section>
  );
}