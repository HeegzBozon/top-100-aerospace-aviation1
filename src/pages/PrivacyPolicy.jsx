import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, Database, UserCheck, ExternalLink, FileText } from 'lucide-react';

const COMPANY = 'TOP 100 Aerospace & Aviation';
const SITE_URL = 'top100aerospaceandaviation.com';
const CONTACT_EMAIL = 'privacy@top100aerospaceandaviation.com';
const EFFECTIVE_DATE = 'March 23, 2026';

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <Icon className="w-5 h-5 flex-shrink-0 text-[--brand-gold]" />
      <h2 className="text-xl font-bold text-[--brand-navy]" style={{ fontFamily: 'var(--brand-font-serif)' }}>
        {title}
      </h2>
    </div>
  );
}

function PolicySection({ icon, title, children }) {
  return (
    <section className="mb-10 pb-10 border-b border-[--brand-navy-18] last:border-b-0">
      {icon && title && <SectionHeader icon={icon} title={title} />}
      {!icon && title && (
        <h2 className="text-xl font-bold mb-4 text-[--brand-navy]" style={{ fontFamily: 'var(--brand-font-serif)' }}>
          {title}
        </h2>
      )}
      <div className="space-y-3 text-base leading-relaxed text-[--brand-navy-80]">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }) {
  return <h3 className="font-semibold mt-4 text-[--brand-navy]">{children}</h3>;
}

function BulletList({ items }) {
  return (
    <ul className="list-disc ml-5 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[--brand-cream]">

      <header className="border-b-2 border-[--brand-navy] py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-7 h-7 text-[--brand-gold]" />
            <h1 className="text-4xl sm:text-5xl font-bold text-[--brand-navy]" style={{ fontFamily: 'var(--brand-font-serif)' }}>
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-[--brand-navy-60]">
            Effective Date: {EFFECTIVE_DATE} &nbsp;·&nbsp; {COMPANY}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        <div className="rounded-xl p-5 mb-8 border border-[--brand-navy-20] bg-[--brand-navy-08]">
          <p className="text-base leading-relaxed text-[--brand-navy]">
            <strong>{COMPANY}</strong> (the "Company") is committed to maintaining robust privacy protections for its users.
            This Privacy Policy is designed to help you understand how we collect, use, and safeguard the information you provide to us,
            and to assist you in making informed decisions when using our Service.
          </p>
          <p className="text-sm mt-3 text-[--brand-navy-60]">
            "Site" refers to our website accessible at <strong>{SITE_URL}</strong>. "Service" refers to the Company's recognition
            platform and related services. "You" refers to you as a user of our Site or Service. By accessing our Site or Service,
            you accept this Privacy Policy and consent to our collection, storage, use, and disclosure of your information as described herein.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10">

          <PolicySection icon={Database} title="I. Information We Collect">
            <p>
              We collect <strong>Non-Personal Information</strong> — data that cannot be used to personally identify you, such as
              anonymous usage data, demographic trends, referring/exit URLs, platform types, and click counts —
              and <strong>Personal Information</strong>, which includes data that can identify you directly.
            </p>
            <SubHeading>1. Information Collected via Technology</SubHeading>
            <p>
              To activate the Service you need only provide your email address. To improve service quality, we automatically track
              information your browser provides when you view or use the Service, including:
            </p>
            <BulletList items={[
              'Referring URL (the website you came from)',
              'Browser type and version',
              'Device and operating system',
              'Time, date, and duration of access',
              'IP address and approximate geographic location',
              'Pages visited and features used within the platform',
            ]} />
            <p className="mt-2">
              We track this information using <strong>cookies</strong> — small text files sent to your browser from our servers and stored
              on your device. We use both persistent cookies (which remain until deleted) and session cookies (which expire when you close
              your browser) to maintain your preferences and improve your experience.
            </p>
            <SubHeading>2. Information You Provide by Registering</SubHeading>
            <p>To use the full Service, you create a personal profile by providing:</p>
            <BulletList items={[
              'Name and email address',
              'Professional information (job title, company, LinkedIn profile URL)',
              'Profile photo and biographical information',
              'Nominations, votes, and platform-generated content you submit',
              'Social media handles you choose to connect',
            ]} />
            <SubHeading>3. Children's Privacy</SubHeading>
            <p>
              The Site and Service are not directed to anyone under the age of 13. We do not knowingly collect or solicit information
              from anyone under 13 or allow anyone under 13 to register. If we learn we have gathered personal information from a child
              under 13 without parental consent, we will delete it immediately. Contact us at <strong>{CONTACT_EMAIL}</strong> if you
              believe this has occurred.
            </p>
          </PolicySection>

          <PolicySection icon={UserCheck} title="II. How We Use and Share Information">
            <SubHeading>Personal Information</SubHeading>
            <p>
              We do not sell, trade, rent, or share your Personal Information with third parties for their marketing purposes without
              your consent. We use your Personal Information to:
            </p>
            <BulletList items={[
              'Operate and maintain the TOP 100 recognition platform',
              'Process nominations, votes, and evaluations',
              'Display honoree profiles, rankings, and accolades',
              'Respond to your questions and provide technical support',
              'Send administrative updates and, where you opt in, promotional communications',
              'Prevent fraud, abuse, and ensure platform integrity',
            ]} />
            <p className="mt-2">
              We share Personal Information with trusted vendors performing services on our behalf (e.g., email delivery, hosting).
              Those vendors access your data only as directed by us and under confidentiality obligations.
            </p>
            <p>
              We may disclose Personal Information if we have a good-faith belief that disclosure is necessary to: comply with applicable
              law or legal process; enforce our Terms of Service; address fraud or security concerns; or protect the rights, property, or
              safety of our users or the public.
            </p>
            <SubHeading>Non-Personal Information</SubHeading>
            <p>
              We use Non-Personal Information to improve the Service and customize user experience. We aggregate this data to track
              trends and analyze usage patterns. We reserve the right to share aggregated, non-identifiable data with partners and
              advertisers.
            </p>
            <SubHeading>Business Transfers</SubHeading>
            <p>
              In the event of a merger, acquisition, or sale of assets, your Personal Information may be transferred as part of that
              transaction. We will post notice of any such change on the Site.
            </p>
          </PolicySection>

          <PolicySection icon={Lock} title="III. How We Protect Information">
            <p>
              We implement security measures designed to protect your information from unauthorized access, including encryption,
              firewalls, and secure socket layer (SSL/TLS) technology. Your account is protected by your password — please keep it
              confidential and log out after each session.
            </p>
            <p>
              However, no method of transmission over the Internet is 100% secure. By using our Service, you acknowledge that you
              understand and agree to assume these inherent risks.
            </p>
          </PolicySection>

          <PolicySection icon={Shield} title="IV. Your Rights Regarding Your Personal Information">
            <p>You have the right at any time to:</p>
            <BulletList items={[
              'Access the personal information we hold about you',
              'Request correction of inaccurate or incomplete data',
              'Request deletion of your personal information',
              'Opt out of marketing and promotional communications (via the unsubscribe link in any email or by contacting us)',
              'Withdraw consent where our processing is based on consent',
            ]} />
            <p className="mt-2">
              Note that even if you opt out of promotional emails, we may still send you administrative communications (e.g., policy updates,
              security notices).
            </p>
          </PolicySection>

          <PolicySection icon={ExternalLink} title="V. Links to Other Websites">
            <p>
              Our Service may contain links to third-party websites or applications. We are not responsible for the privacy practices
              or content of those sites. This Privacy Policy applies solely to information collected by us through the Site and Service.
              We encourage you to read the privacy policies of any third-party sites you visit.
            </p>
          </PolicySection>

          <PolicySection icon={FileText} title="VI. Changes to Our Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes by posting the revised
              policy on this page with an updated effective date. If changes are significant, we may also send an email notification.
              We encourage you to review this page periodically.
            </p>
          </PolicySection>

          <PolicySection icon={Mail} title="VII. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="mt-3 p-4 rounded-lg border border-[--brand-navy-20] bg-[--brand-navy-08] inline-block">
              <p className="font-semibold text-[--brand-navy]">{COMPANY}</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm hover:underline font-medium text-[--brand-gold]"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
          </PolicySection>

        </div>

        <div className="text-center mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-[--brand-navy] transition-all hover:scale-105 hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>

      </main>
    </div>
  );
}