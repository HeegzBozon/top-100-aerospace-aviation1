import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, Database, UserCheck, ExternalLink, FileText, Brain, Server, Landmark, BookOpen, Clock, AlertTriangle } from 'lucide-react';

const COMPANY = 'TOP 100 Aerospace & Aviation';
const SITE_URL = 'top100aero.space';
const CONTACT_EMAIL = 'privacy@top100aero.space';
const VERSION = '2.0';

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
            Version {VERSION} &nbsp;·&nbsp; {COMPANY}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        {/* Intro */}
        <div className="rounded-xl p-5 mb-8 border border-[--brand-navy-20] bg-[--brand-navy-08]">
          <p className="text-base leading-relaxed text-[--brand-navy]">
            <strong>{COMPANY}</strong> (the "Company," "we," "us," or "our") is committed to maintaining robust privacy protections
            for our users and the individuals whose information we hold. This Privacy Policy is designed to help you understand how
            we collect, use, store, and safeguard information, and to assist you in making informed decisions when using our Service
            or when we hold information about you.
          </p>
          <p className="text-sm mt-3 text-[--brand-navy-60]">
            "Site" refers to our website accessible at <strong>{SITE_URL}</strong>. "Service" refers to the Company's recognition
            platform and related services. "You" refers to you as a user of our Site or Service, or as an individual whose
            information we hold. By accessing our Site or Service, you accept this Privacy Policy and consent to our collection,
            storage, use, and disclosure of your information as described herein.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10">

          {/* I. Information We Collect and Hold */}
          <PolicySection icon={Database} title="I. Information We Collect and Hold">
            <p>
              We hold <strong>Non-Personal Information</strong> — data that cannot be used to personally identify you, such as
              anonymous usage data, demographic trends, referring and exit URLs, platform types, and click counts —
              and <strong>Personal Information</strong>, which includes data that can identify you directly or through reasonable
              association with other information.
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
            <p>
              Cookies apply to your interactions with our web surfaces. They do not apply to internal operational records maintained
              in our private systems.
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

            <SubHeading>3. Information We Receive From Others</SubHeading>
            <p>We may collect and retain information about you that we obtain from sources other than you directly, including:</p>
            <BulletList items={[
              <span key="nom"><strong>Nominations submitted by third parties.</strong> If you are nominated for recognition, we retain the nomination submission, the nominator's attribution, and any accompanying context.</span>,
              <span key="pub"><strong>Publicly available professional information.</strong> We may reference publicly available information (LinkedIn public profiles, company websites, published interviews, and similar public sources) when relevant to our recognition, editorial, or outreach activities.</span>,
              <span key="ctx"><strong>Professional context shared by others.</strong> Information shared by your employer, colleagues, or other professional contacts as part of our relationship-management activities.</span>,
              <span key="int"><strong>Information from integrated platforms.</strong> We operate integrations with platforms including Wefunder (for investor relationships), LinkedIn (for professional context), and email providers (for correspondence). Information retrieved through these integrations is stored in our systems and subject to this Policy.</span>,
            ]} />
            <p className="mt-2">
              When we hold information about you that we did not obtain directly from you, you have the same rights regarding
              that information as described in Section IV below.
            </p>

            <SubHeading>4. Information We Derive Through AI-Assisted Processing</SubHeading>
            <p>
              Our internal systems use AI assistants (including Anthropic's Claude) to help organize, synthesize, and cross-reference
              information. Through this operation, we may create new records about you, such as:
            </p>
            <BulletList items={[
              'Summaries and syntheses of our interactions with you',
              'Relationship attribution (how we came to know you, who introduced us, relevant context from prior interactions)',
              'Inferred relationships between you and other records in our system',
              'Automated quality checks and consistency flags across our records',
            ]} />
            <p className="mt-2">
              This derived information is treated as your personal information and subject to the same rights and protections as
              information you provided directly.
            </p>

            <SubHeading>5. Children's Privacy</SubHeading>
            <p>
              The Site and Service are not directed to anyone under the age of 13. We do not knowingly collect or solicit information
              from anyone under 13 or allow anyone under 13 to register. If we learn we have gathered personal information from a child
              under 13 without parental consent, we will delete it immediately. Contact us at <strong>{CONTACT_EMAIL}</strong> if you
              believe this has occurred.
            </p>
          </PolicySection>

          {/* II. How We Use and Share Information */}
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
              'Maintain records of our business relationships with Fellows, investors, sponsors, advisors, and other contacts',
              'Prevent fraud, abuse, and ensure platform integrity',
            ]} />
            <p className="mt-2">
              We share Personal Information with trusted vendors performing services on our behalf (for example, email delivery
              and hosting). Those vendors access your data only as directed by us and under confidentiality obligations.
            </p>
            <p>
              We may disclose Personal Information if we have a good-faith belief that disclosure is necessary to: comply with applicable
              law or legal process; enforce our Terms of Service; address fraud or security concerns; or protect the rights, property, or
              safety of our users or the public.
            </p>

            <SubHeading>AI-Assisted Operations</SubHeading>
            <p>
              We use AI assistants, including Anthropic's Claude, as an integral part of our internal operations. These AI systems help us:
            </p>
            <BulletList items={[
              'Organize and index information about our Fellows, investors, sponsors, and other contacts',
              'Synthesize insights from our interactions and relationships',
              'Maintain the integrity of our records through automated quality checks',
              'Draft communications and prepare briefings',
            ]} />
            <p className="mt-2">Under our agreement with our AI provider:</p>
            <BulletList items={[
              'Your information is processed transiently for these operations and is not used to train the AI provider\'s models',
              'Your information is not retained by the AI provider beyond the specific processing operation',
              'The AI provider acts as our processor, subject to our direction and confidentiality obligations',
            ]} />
            <p className="mt-2">
              We rely on our legitimate interest in maintaining efficient operations as the legal basis for AI-assisted processing
              of your information. You may object to AI-assisted processing of your information by contacting us (see Section IV).
              Note that objecting may limit our ability to maintain comprehensive records about you in our systems.
            </p>

            <SubHeading>Our Internal Systems</SubHeading>
            <p>
              We operate multiple connected internal systems, each holding different subsets of your information for different purposes:
            </p>
            <BulletList items={[
              <span key="sub"><strong>A private intelligence substrate</strong> — our primary storage for relationship and operational data</span>,
              <span key="team"><strong>A team coordination system</strong> — containing minimal information needed for active work execution by our team</span>,
              <span key="pub"><strong>A public-facing platform</strong> — containing only information you have explicitly claimed and published, such as your claimed Fellow profile</span>,
            ]} />
            <p className="mt-2">
              Information flows between these systems under internal rules that minimize unnecessary transmission. Each cross-system
              transfer of personal information is logged for audit purposes.
            </p>
            <p>
              We also retrieve information from third-party services where we have operational integrations, including Gmail for
              correspondence, LinkedIn for professional context, and Wefunder for investor relationships. Retrieved information is
              stored in our substrate and subject to this Policy.
            </p>

            <SubHeading>Wefunder and Investment-Related Communications</SubHeading>
            <p>If you interact with us in connection with our Wefunder campaign or other investment activities:</p>
            <BulletList items={[
              'Your communications with us are retained for at least five years in accordance with U.S. Securities and Exchange Commission Regulation Crowdfunding record-keeping requirements.',
              'This five-year retention applies regardless of other deletion requests you may make, to comply with SEC regulatory obligations.',
              'After the five-year period, your investment-related information is handled according to our standard retention policies.',
              'Specific rules apply to public content about our offering during active amendment periods; such content may be subject to internal review holds before publication.',
            ]} />

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

          {/* III. How We Store and Protect Information */}
          <PolicySection icon={Lock} title="III. How We Store and Protect Information">
            <SubHeading>Storage Architecture</SubHeading>
            <p>
              Your information is stored primarily in a private, local-first intelligence substrate on operator-controlled infrastructure.
              Backup copies are maintained in a private, access-restricted repository under our sole control. Public-facing information
              (such as claimed Fellow profiles) is stored on our public platform.
            </p>
            <p>
              Your information is not stored in shared cloud databases or third-party SaaS systems except for specific integrations
              as described in Section II.
            </p>

            <SubHeading>Access Controls</SubHeading>
            <p>
              Access to your information is limited to authorized operators of {COMPANY}, specifically our founder, operations and
              legal lead, and designated team members. AI assistants operate only on explicit operator direction and under scoped permissions.
            </p>

            <SubHeading>Technical Protections</SubHeading>
            <p>We use:</p>
            <BulletList items={[
              'Full-disk encryption on operator-controlled hardware',
              'Encryption at rest for backup storage',
              'SSL/TLS for all transmissions',
              'Access logging for cross-system data transfers',
              'Password protection and multi-factor authentication for operator account access',
            ]} />

            <SubHeading>Account Security</SubHeading>
            <p>
              Your account is protected by your password — please keep it confidential and log out after each session.
            </p>

            <SubHeading>Inherent Risks</SubHeading>
            <p>
              No method of transmission or storage is 100% secure. By using our Service, you acknowledge and assume these inherent risks.
            </p>

            <SubHeading>Breach Notification</SubHeading>
            <p>
              In the event of a data breach affecting your information, we will notify you within 72 hours of our confirmation of the
              breach, including information about the nature of the breach, likely consequences, and measures we have taken or will take
              to address it. We will also notify the relevant supervisory authorities where required by applicable law.
            </p>
          </PolicySection>

          {/* IV. Your Rights Regarding Your Information */}
          <PolicySection icon={Shield} title="IV. Your Rights Regarding Your Information">
            <p>You have the following rights regarding information we hold about you:</p>

            <SubHeading>Right of Access</SubHeading>
            <p>
              You may request a copy of the information we hold about you. We will respond within 30 days. Our response will include
              all substantive records associated with you, formatted as a structured export.
            </p>

            <SubHeading>Right to Correction</SubHeading>
            <p>
              You may request correction of inaccurate or incomplete information. We will review and, where appropriate, update the
              information within 30 days, retaining an audit record of the correction.
            </p>

            <SubHeading>Right to Deletion</SubHeading>
            <p>You may request deletion of your information. Deletion requests are handled in two ways:</p>
            <p>
              <strong>Public Unpublishing.</strong> If you have a public profile (such as a claimed Fellow profile), we will remove it
              from public rendering within 30 days. Internal operational records may be retained per our legitimate interests and legal obligations.
            </p>
            <p>
              <strong>Full Erasure.</strong> If you request complete erasure of all your information, we will honor this within 30 days,
              subject to legal retention obligations. These obligations may include active contracts, U.S. Securities and Exchange Commission
              Regulation Crowdfunding retention requirements for Wefunder-adjacent records (five years), standard business records retention
              (seven years for commitment records), and applicable law. Records retained under legal obligation are marked as such and are
              not used for any active operational purpose.
            </p>
            <p>
              When you submit a deletion request, we will contact you to clarify which type of deletion you are requesting before acting on it.
            </p>

            <SubHeading>Right to Portability</SubHeading>
            <p>
              Where your information is processed by automated means based on your consent or on a contract with you, you may request a
              machine-readable export of that information for transfer to another system. We provide such exports in a structured format
              within 30 days.
            </p>

            <SubHeading>Right to Object to Processing</SubHeading>
            <p>You may object to specific types of processing of your information, including:</p>
            <BulletList items={[
              'Marketing and promotional communications (immediate effect upon objection; we may still send administrative communications)',
              'Profiling or automated decision-making',
              'Inclusion in our AI-assisted operational systems (note that objecting may limit our ability to maintain comprehensive records about you)',
            ]} />

            <SubHeading>Right to Withdraw Consent</SubHeading>
            <p>
              Where our processing is based on your consent, you may withdraw consent at any time. Withdrawal does not affect the
              lawfulness of processing based on consent before its withdrawal.
            </p>

            <SubHeading>Right to Lodge a Complaint</SubHeading>
            <p>
              You may lodge a complaint with your local data protection authority if you believe we have handled your information
              improperly. This right is in addition to your ability to contact us directly.
            </p>

            <SubHeading>How to Exercise These Rights</SubHeading>
            <p>
              To exercise any of these rights, contact us at <strong>{CONTACT_EMAIL}</strong>. We may require identity verification
              before honoring your request, to protect against unauthorized disclosure. We do not charge a fee for exercising these
              rights except in cases of manifestly unfounded or excessive requests, where we may charge a reasonable fee or refuse the
              request in accordance with applicable law.
            </p>

            <SubHeading>Response Time</SubHeading>
            <p>
              We respond to rights requests within 30 days. In complex cases, we may extend this period by up to 60 additional days,
              with notice to you of the extension and the reason.
            </p>

            <SubHeading>Administrative Communications</SubHeading>
            <p>
              Note that even if you opt out of promotional emails, we may still send you administrative communications (for example,
              policy updates, security notices, or direct responses to your inquiries).
            </p>
          </PolicySection>

          {/* V. Links to Other Websites */}
          <PolicySection icon={ExternalLink} title="V. Links to Other Websites">
            <p>
              Our Service may contain links to third-party websites or applications. We are not responsible for the privacy practices
              or content of those sites. This Privacy Policy applies solely to information collected by us through the Site and Service.
              We encourage you to read the privacy policies of any third-party sites you visit.
            </p>
          </PolicySection>

          {/* VI. Changes to Our Privacy Policy */}
          <PolicySection icon={FileText} title="VI. Changes to Our Privacy Policy">
            <p>We may update this Privacy Policy from time to time.</p>
            <p>
              <strong>For material changes</strong> (those that expand how we collect, use, or share your information), we will notify
              registered users by email at least 30 days before the change takes effect.
            </p>
            <p>
              <strong>For non-material changes</strong> (clarifications, typographical corrections, updates reflecting changes in our
              service providers), we will post the revised policy with an updated effective date, without advance notice.
            </p>
            <p>
              We encourage you to review this page periodically. Your continued use of the Service after the effective date of a change
              constitutes acceptance of the revised Policy.
            </p>
            <p>Prior versions of this Privacy Policy are archived and available upon request.</p>
          </PolicySection>

          {/* VII. Contact Us */}
          <PolicySection icon={Mail} title="VII. Contact Us">
            <p>
              If you have questions, concerns, or requests regarding this Privacy Policy or our data practices:
            </p>
            <div className="mt-3 p-4 rounded-lg border border-[--brand-navy-20] bg-[--brand-navy-08] space-y-2">
              <p className="font-semibold text-[--brand-navy]">{COMPANY}</p>
              <p className="text-sm text-[--brand-navy-80]">Attn: Operations &amp; Legal</p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-sm hover:underline font-medium text-[--brand-gold] block"
              >
                {CONTACT_EMAIL}
              </a>
            </div>
            <p className="mt-3 text-sm">
              <strong>Response Commitment:</strong> We acknowledge receipt of privacy inquiries within 5 business days and provide a
              substantive response within 30 days. Complex requests may require an extension of up to 60 additional days, with notice.
            </p>
          </PolicySection>

          {/* Glossary */}
          <PolicySection icon={BookOpen} title="Appendix: Glossary">
            <p>For clarity:</p>
            <BulletList items={[
              <span key="pi"><strong>"Personal Information"</strong> means information that identifies you directly, or that can be reasonably used in combination with other information to identify you.</span>,
              <span key="npi"><strong>"Non-Personal Information"</strong> means information that cannot be used to identify you.</span>,
              <span key="proc"><strong>"Processing"</strong> means any operation performed on your information, including collecting, storing, analyzing, synthesizing, retrieving, and deleting.</span>,
              <span key="ai"><strong>"AI Provider"</strong> currently refers to Anthropic, Inc., the provider of Claude, which is our primary AI assistant.</span>,
              <span key="op"><strong>"Operator"</strong> refers to an authorized person at {COMPANY} who has access to our internal systems.</span>,
            ]} />
          </PolicySection>

          {/* Version History */}
          <PolicySection icon={Clock} title="Version History">
            <BulletList items={[
              <span key="v2"><strong>v2.0</strong> — Substantial revision to reflect AI-assisted operations, private intelligence substrate architecture, expanded user rights per GDPR/CCPA, Wefunder-specific SEC Reg CF retention requirements, federation of internal systems, and breach notification procedures. Supersedes v1.0.</span>,
              <span key="v1"><strong>v1.0</strong> — Original privacy policy for SaaS-shaped recognition platform.</span>,
            ]} />
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