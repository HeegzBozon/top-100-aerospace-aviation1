import LLProHero from '@/components/local-legends-pro/LLProHero';
import LLProWhoFor from '@/components/local-legends-pro/LLProWhoFor';
import LLProWhatsInside from '@/components/local-legends-pro/LLProWhatsInside';
import LLProRelocation from '@/components/local-legends-pro/LLProRelocation';
import LLProCurators from '@/components/local-legends-pro/LLProCurators';
import LLProPlatform from '@/components/local-legends-pro/LLProPlatform';
import LLProFooter from '@/components/local-legends-pro/LLProFooter';

export default function LocalLegendsPro() {
  return (
    <div className="min-h-screen sf-pro">
      <LLProHero />
      <LLProWhoFor />
      <LLProWhatsInside />
      <LLProRelocation />
      <LLProCurators />
      <LLProPlatform />
      <LLProFooter />
    </div>
  );
}