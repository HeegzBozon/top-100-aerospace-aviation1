import { Link } from 'react-router-dom';
import { FileText, UserCircle, Lock, Shield, AlertTriangle, ExternalLink, Scale, Ban, Copyright, Settings, Mail } from 'lucide-react';

const COMPANY = 'TOP 100 Aerospace & Aviation Corporation';
const SITE_URL = 'https://top100aero.space';
const CONTACT_EMAIL = 'matthew@top100aero.space';
const CONTACT_ADDRESS = '3910 Cheverly Dr E, Lakeland, Florida 33813';
const CONTACT_PHONE = '(209) 207-4504';
const EFFECTIVE_DATE = 'March 23, 2026';

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-start gap-3 mb-4">
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-[--brand-gold]" />
      <h2 className="text-xl font-bold leading-tight text-[--brand-navy]" style={{ fontFamily: 'var(--brand-font-serif)' }}>
        {title}
      </h2>
    </div>
  );
}

function SubSection({ number, title, children }) {
  return (
    <div className="mb-5">
      <h3 className="font-semibold mb-2 text-base text-[--brand-navy]">{number} {title}</h3>
      <div className="space-y-2 text-sm leading-relaxed text-[--brand-navy-80]">{children}</div>
    </div>
  );
}

function PolicySection({ icon, title, children }) {
  return (
    <section className="mb-10 pb-10 border-b border-[--brand-navy-18] last:border-b-0">
      <SectionHeader icon={icon} title={title} />
      <div className="space-y-4 text-sm leading-relaxed text-[--brand-navy-80]">{children}</div>
    </section>
  );
}

function WarningBox({ children }) {
  return (
    <div className="rounded-lg p-4 border-l-4 border-orange-400 bg-orange-50 my-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-orange-700 mb-1">Important Notice</p>
      <p className="text-sm leading-relaxed text-orange-900">{children}</p>
    </div>
  );
}

function ArbitrageBox({ children }) {
  return (
    <div className="rounded-lg p-4 border-l-4 border-red-500 bg-red-50 mb-3">
      <p className="text-sm font-semibold text-red-700 mb-1">Binding Arbitration Agreement</p>
      <p className="text-sm text-red-900">{children}</p>
    </div>
  );
}

function DisclaimerBox({ children }) {
  return (
    <div className="rounded-lg p-4 border border-[--brand-navy-20] bg-[--brand-navy-08] text-sm font-medium leading-relaxed uppercase tracking-wide text-[--brand-navy]">
      {children}
    </div>
  );
}

function BulletList({ items }) {
  return (
    <ul className="list-disc ml-5 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ul>
  );
}

function OrderedList({ items }) {
  return (
    <ol className="list-decimal ml-5 space-y-1.5">
      {items.map((item, i) => <li key={i}>{item}</li>)}
    </ol>
  );
}

function ContactCard() {
  return (
    <div className="mt-2 p-4 rounded-lg border border-[--brand-navy-20] bg-[--brand-navy-08] inline-block">
      <p className="font-semibold text-[--brand-navy]">Matthew Higa</p>
      <p className="text-sm mt-1 text-[--brand-navy-80]">
        {CONTACT_ADDRESS}<br />
        Telephone: {CONTACT_PHONE}<br />
        <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline font-medium text-[--brand-gold]">
          {CONTACT_EMAIL}
        </a>
      </p>
    </div>
  );
}

export default function TermsOfService() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-[--brand-cream]">

      <header className="border-b-2 border-[--brand-navy] py-10 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-3 mb-3">
            <FileText className="w-7 h-7 text-[--brand-gold]" />
            <h1 className="text-4xl sm:text-5xl font-bold text-[--brand-navy]" style={{ fontFamily: 'var(--brand-font-serif)' }}>
              Terms of Use
            </h1>
          </div>
          <p className="text-sm text-[--brand-navy-60]">
            Version 1.0 &nbsp;·&nbsp; Last Revised: {EFFECTIVE_DATE} &nbsp;·&nbsp; {COMPANY}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">

        <div className="rounded-xl p-5 mb-8 border border-[--brand-navy-20] bg-[--brand-navy-08]">
          <p className="text-sm leading-relaxed mb-3 text-[--brand-navy]">
            The website located at <strong>{SITE_URL}</strong> (the "Site") is a copyrighted work belonging to{' '}
            <strong>{COMPANY}</strong> ("Company", "us", "our", and "we"). Certain features of the Site may be subject to
            additional guidelines, terms, or rules, which will be posted on the Site in connection with such features.
            All such additional terms, guidelines, and rules are incorporated by reference into these Terms.
          </p>
          <p className="text-sm leading-relaxed text-[--brand-navy]">
            These Terms of Use ("Terms") set forth the legally binding terms and conditions that govern your use of the Site.
            By accessing or using the Site, you are accepting these Terms.{' '}
            <strong>You may not access or use the Site if you are not at least 18 years old.</strong>{' '}
            If you do not agree with all provisions of these Terms, do not access and/or use the Site.
          </p>
        </div>

        <WarningBox>
          Please be aware that Section 10.2 contains provisions governing how to resolve disputes between you and Company,
          including a binding arbitration agreement and class action waiver. Unless you opt out within 30 days, you will only
          be permitted to pursue disputes on an individual basis and waive your right to a jury trial. Please read Section 10.2 carefully.
        </WarningBox>

        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-10">

          <PolicySection icon={UserCircle} title="1. Accounts">
            <SubSection number="1.1." title="Account Creation">
              <p>
                In order to use certain features of the Site, you must register for an account ("Account") and provide certain
                information about yourself as prompted by the account registration form. You represent and warrant that:
                (a) all required registration information you submit is truthful and accurate; (b) you will maintain the accuracy
                of such information. You may delete your Account at any time, for any reason, by following the instructions on
                the Site. Company may suspend or terminate your Account in accordance with Section 8.
              </p>
            </SubSection>
            <SubSection number="1.2." title="Account Responsibilities">
              <p>
                You are responsible for maintaining the confidentiality of your Account login information and are fully responsible
                for all activities that occur under your Account. You agree to immediately notify Company of any unauthorized use,
                or suspected unauthorized use of your Account or any other breach of security. Company cannot and will not be liable
                for any loss or damage arising from your failure to comply with the above requirements.
              </p>
            </SubSection>
          </PolicySection>

          <PolicySection icon={Lock} title="2. Access to the Site">
            <SubSection number="2.1." title="License">
              <p>
                Subject to these Terms, Company grants you a non-transferable, non-exclusive, revocable, limited license to use
                and access the Site solely for your own personal, noncommercial use.
              </p>
            </SubSection>
            <SubSection number="2.2." title="Certain Restrictions">
              <p>The rights granted to you in these Terms are subject to the following restrictions:</p>
              <BulletList items={[
                'You shall not license, sell, rent, lease, transfer, assign, distribute, host, or otherwise commercially exploit the Site, whether in whole or in part, or any content displayed on the Site.',
                'You shall not modify, make derivative works of, disassemble, reverse compile or reverse engineer any part of the Site.',
                'You shall not access the Site in order to build a similar or competitive website, product, or service.',
                'Except as expressly stated herein, no part of the Site may be copied, reproduced, distributed, republished, downloaded, displayed, posted or transmitted in any form or by any means.',
              ]} />
            </SubSection>
            <SubSection number="2.3." title="Modification">
              <p>
                Company reserves the right, at any time, to modify, suspend, or discontinue the Site (in whole or in part) with
                or without notice to you. You agree that Company will not be liable to you or to any third party for any
                modification, suspension, or discontinuation of the Site or any part thereof.
              </p>
            </SubSection>
            <SubSection number="2.4." title="No Support or Maintenance">
              <p>
                You acknowledge and agree that Company will have no obligation to provide you with any support or maintenance
                in connection with the Site.
              </p>
            </SubSection>
            <SubSection number="2.5." title="Ownership">
              <p>
                Excluding any User Content that you may provide, you acknowledge that all the intellectual property rights,
                including copyrights, patents, trade marks, and trade secrets, in the Site and its content are owned by Company
                or Company's suppliers. Neither these Terms (nor your access to the Site) transfers to you or any third party
                any rights, title or interest in or to such intellectual property rights, except for the limited access rights
                expressly set forth in Section 2.1. Company and its suppliers reserve all rights not granted in these Terms.
                There are no implied licenses granted under these Terms.
              </p>
            </SubSection>
            <SubSection number="2.6." title="Feedback">
              <p>
                If you provide Company with any feedback or suggestions regarding the Site ("Feedback"), you hereby assign to
                Company all rights in such Feedback and agree that Company shall have the right to use and fully exploit such
                Feedback and related information in any manner it deems appropriate. Company will treat any Feedback you provide
                as non-confidential and non-proprietary. You agree that you will not submit to Company any information or ideas
                that you consider to be confidential or proprietary.
              </p>
            </SubSection>
          </PolicySection>

          <PolicySection icon={Settings} title="3. User Content">
            <SubSection number="3.1." title="User Content">
              <p>
                "User Content" means any and all information and content that a user submits to, or uses with, the Site
                (e.g., content in the user's profile or postings). You are solely responsible for your User Content. You
                assume all risks associated with use of your User Content, including any reliance on its accuracy,
                completeness or usefulness by others, or any disclosure of your User Content that personally identifies you
                or any third party.
              </p>
              <p>
                You may not represent or imply to others that your User Content is in any way provided, sponsored or endorsed
                by Company. Company is not obligated to backup any User Content, and your User Content may be deleted at any
                time without prior notice. You are solely responsible for creating and maintaining your own backup copies of
                your User Content if you desire.
              </p>
            </SubSection>
            <SubSection number="3.2." title="License">
              <p>
                You hereby grant (and you represent and warrant that you have the right to grant) to Company an irrevocable,
                nonexclusive, royalty-free and fully paid, worldwide license to reproduce, distribute, publicly display and
                perform, prepare derivative works of, incorporate into other works, and otherwise use and exploit your User
                Content, and to grant sublicenses of the foregoing rights, solely for the purposes of including your User
                Content in the Site. You hereby irrevocably waive any claims and assertions of moral rights or attribution
                with respect to your User Content.
              </p>
            </SubSection>
            <SubSection number="3.3." title="Acceptable Use Policy">
              <p>You agree not to use the Site to collect, upload, transmit, display, or distribute any User Content that:</p>
              <BulletList items={[
                "Violates any third-party right, including any copyright, trademark, patent, trade secret, moral right, privacy right, right of publicity, or any other intellectual property or proprietary right.",
                "Is unlawful, harassing, abusive, tortious, threatening, harmful, invasive of another's privacy, vulgar, defamatory, false, intentionally misleading, pornographic, obscene, promotes racism, bigotry, hatred, or physical harm of any kind.",
                "Is harmful to minors in any way.",
                "Is in violation of any law, regulation, or obligations or restrictions imposed by any third party.",
              ]} />
              <p className="mt-2">In addition, you agree not to:</p>
              <BulletList items={[
                'Upload, transmit, or distribute to or through the Site any computer viruses, worms, or any software intended to damage or alter a computer system or data.',
                'Send through the Site unsolicited or unauthorized advertising, promotional materials, junk mail, spam, chain letters, pyramid schemes, or any other form of duplicative or unsolicited messages.',
                'Use the Site to harvest, collect, gather or assemble information or data regarding other users, including e-mail addresses, without their consent.',
                'Interfere with, disrupt, or create an undue burden on servers or networks connected to the Site.',
                'Attempt to gain unauthorized access to the Site (or to other computer systems or networks connected to or used together with the Site), whether through password mining or any other means.',
                "Harass or interfere with any other user's use and enjoyment of the Site.",
                'Use software or automated agents or scripts to produce multiple accounts on the Site, or to generate automated searches, requests, or queries to (or to strip, scrape, or mine data from) the Site.',
              ]} />
            </SubSection>
            <SubSection number="3.4." title="Enforcement">
              <p>
                We reserve the right (but have no obligation) to review, refuse and/or remove any User Content in our sole
                discretion, and to investigate and/or take appropriate action against you if you violate the Acceptable Use
                Policy or any other provision of these Terms. Such action may include removing or modifying your User Content,
                terminating your Account in accordance with Section 8, and/or reporting you to law enforcement authorities.
              </p>
            </SubSection>
          </PolicySection>

          <PolicySection icon={Shield} title="4. Indemnification">
            <p>
              You agree to indemnify and hold Company (and its officers, employees, and agents) harmless, including costs and
              attorneys' fees, from any claim or demand made by any third party due to or arising out of (a) your use of the
              Site, (b) your violation of these Terms, (c) your violation of applicable laws or regulations or (d) your User
              Content. Company reserves the right, at your expense, to assume the exclusive defense and control of any matter
              for which you are required to indemnify us, and you agree to cooperate with our defense of these claims. You
              agree not to settle any matter without the prior written consent of Company.
            </p>
          </PolicySection>

          <PolicySection icon={ExternalLink} title="5. Third-Party Links & Ads; Other Users">
            <SubSection number="5.1." title="Third-Party Links & Ads">
              <p>
                The Site may contain links to third-party websites and services, and/or display advertisements for third
                parties (collectively, "Third-Party Links & Ads"). Such Third-Party Links & Ads are not under the control
                of Company, and Company is not responsible for any Third-Party Links & Ads. You use all Third-Party Links &
                Ads at your own risk. When you click on any of the Third-Party Links & Ads, the applicable third party's
                terms and policies apply, including their privacy and data gathering practices.
              </p>
            </SubSection>
            <SubSection number="5.2." title="Other Users">
              <p>
                Each Site user is solely responsible for any and all of its own User Content. Since we do not control User
                Content, you acknowledge and agree that we are not responsible for any User Content, whether provided by you
                or by others. We make no guarantees regarding the accuracy, currency, suitability, appropriateness, or quality
                of any User Content. Your interactions with other Site users are solely between you and such users. You agree
                that Company will not be responsible for any loss or damage incurred as the result of any such interactions.
                If there is a dispute between you and any Site user, we are under no obligation to become involved.
              </p>
            </SubSection>
            <SubSection number="5.3." title="Release">
              <p>
                You hereby release and forever discharge Company (and our officers, employees, agents, successors, and assigns)
                from each and every past, present and future dispute, claim, controversy, demand, right, obligation, liability,
                action and cause of action of every kind and nature that has arisen or arises directly or indirectly out of,
                or that relates directly or indirectly to, the Site (including any interactions with, or act or omission of,
                other Site users or any Third-Party Links & Ads).
              </p>
              <p className="text-xs font-medium uppercase tracking-wide mt-2 text-[--brand-navy]">
                If you are a California resident, you hereby waive California Civil Code Section 1542, which states: "A general
                release does not extend to claims which the creditor or releasing party does not know or suspect to exist in
                his or her favor at the time of executing the release, which if known by him or her must have materially
                affected his or her settlement with the debtor or released party."
              </p>
            </SubSection>
          </PolicySection>

          <PolicySection icon={AlertTriangle} title="6. Disclaimers">
            <DisclaimerBox>
              <p>
                The Site is provided on an "as-is" and "as available" basis, and Company (and our suppliers) expressly
                disclaim any and all warranties and conditions of any kind, whether express, implied, or statutory, including
                all warranties or conditions of merchantability, fitness for a particular purpose, title, quiet enjoyment,
                accuracy, or non-infringement. We make no warranty that the Site will meet your requirements, will be
                available on an uninterrupted, timely, secure, or error-free basis, or will be accurate, reliable, free of
                viruses or other harmful code, complete, legal, or safe. If applicable law requires any warranties with
                respect to the Site, all such warranties are limited in duration to 90 days from the date of first use.
              </p>
            </DisclaimerBox>
          </PolicySection>

          <PolicySection icon={Ban} title="7. Limitation on Liability">
            <DisclaimerBox>
              <p className="mb-3">
                To the maximum extent permitted by law, in no event shall Company (or our suppliers) be liable to you or
                any third party for any lost profits, lost data, costs of procurement of substitute products, or any
                indirect, consequential, exemplary, incidental, special or punitive damages arising from or relating to
                these Terms or your use of, or inability to use, the Site, even if Company has been advised of the
                possibility of such damages.
              </p>
              <p>
                To the maximum extent permitted by law, our liability to you for any damages arising from or related to
                these Terms will at all times be limited to a maximum of fifty US dollars ($50.00). The existence of more
                than one claim will not enlarge this limit.
              </p>
            </DisclaimerBox>
          </PolicySection>

          <PolicySection icon={Scale} title="8. Term and Termination">
            <p>
              Subject to this Section, these Terms will remain in full force and effect while you use the Site. We may
              suspend or terminate your rights to use the Site (including your Account) at any time for any reason at our
              sole discretion, including for any use of the Site in violation of these Terms. Upon termination of your
              rights under these Terms, your Account and right to access and use the Site will terminate immediately.
            </p>
            <p>
              You understand that any termination of your Account may involve deletion of your User Content associated with
              your Account from our live databases. Company will not have any liability whatsoever to you for any termination
              of your rights under these Terms. Even after your rights under these Terms are terminated, the following
              provisions will remain in effect: Sections 2.2 through 2.6, Section 3 and Sections 4 through 10.
            </p>
          </PolicySection>

          <PolicySection icon={Copyright} title="9. Copyright Policy (DMCA)">
            <p>
              Company respects the intellectual property of others and asks that users of our Site do the same. We have
              adopted and implemented a policy respecting copyright law that provides for the removal of any infringing
              materials and for the termination of users of our Site who are repeat infringers of intellectual property
              rights, including copyrights.
            </p>
            <p>
              If you believe that one of our users is unlawfully infringing the copyright(s) in a work, and wish to have
              the allegedly infringing material removed, the following information (pursuant to 17 U.S.C. § 512(c)) must
              be provided in writing to our designated Copyright Agent:
            </p>
            <OrderedList items={[
              'Your physical or electronic signature.',
              'Identification of the copyrighted work(s) that you claim to have been infringed.',
              'Identification of the material on our services that you claim is infringing and that you request us to remove.',
              'Sufficient information to permit us to locate such material.',
              'Your address, telephone number, and e-mail address.',
              'A statement that you have a good faith belief that use of the objectionable material is not authorized by the copyright owner, its agent, or under the law.',
              'A statement that the information in the notification is accurate, and under penalty of perjury, that you are either the owner of the copyright that has allegedly been infringed or that you are authorized to act on behalf of the copyright owner.',
            ]} />
            <p className="text-xs mt-3 text-[--brand-navy-60]">
              Pursuant to 17 U.S.C. § 512(f), any misrepresentation of material fact in a written notification automatically
              subjects the complaining party to liability for any damages, costs and attorney's fees incurred by us in
              connection with the written notification and allegation of copyright infringement.
            </p>
            <div className="mt-4 p-4 rounded-lg border border-[--brand-navy-20] bg-[--brand-navy-08]">
              <p className="font-semibold mb-1 text-[--brand-navy]">Designated Copyright Agent</p>
              <p className="text-sm text-[--brand-navy-80]">
                Matthew Higa<br />
                {CONTACT_ADDRESS}<br />
                Telephone: {CONTACT_PHONE}<br />
                Email:{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="hover:underline text-[--brand-gold]">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          </PolicySection>

          <PolicySection icon={Settings} title="10. General">
            <SubSection number="10.1." title="Changes">
              <p>
                These Terms are subject to occasional revision. If we make any substantial changes, we may notify you by
                sending you an e-mail to the last e-mail address you provided to us, and/or by prominently posting notice
                of the changes on our Site. Continued use of our Site following notice of such changes shall indicate your
                acknowledgement of such changes and agreement to be bound by the terms and conditions of such changes.
              </p>
            </SubSection>
            <SubSection number="10.2." title="Dispute Resolution & Arbitration">
              <ArbitrageBox>
                You agree that any dispute between you and Company relating in any way to the Site, the services offered
                on the Site, or these Terms will be resolved by binding arbitration, rather than in court, except for:
                (1) individualized small claims court claims; and (2) equitable relief for intellectual property
                infringement. This Arbitration Agreement survives the expiration or termination of these Terms.
              </ArbitrageBox>
              <BulletList items={[
                'Informal Dispute Resolution: Before commencing arbitration, parties must personally meet and confer in good faith within 45 days of written Notice. Send Notice to: matthew@top100aero.space or 3910 Cheverly Dr E, Lakeland, Florida 33813.',
                'Arbitration Forum: Conducted by JAMS. Claims under $250,000 use JAMS Streamlined Rules; all others use JAMS Comprehensive Rules. See www.jamsadr.com.',
                'Waiver of Jury Trial: You waive your right to sue in court and have a trial in front of a judge or jury.',
                'No Class Actions: Claims may only be brought on an individual basis. You waive all rights to participate in any class, collective, representative, or mass action.',
                '30-Day Opt-Out Right: You may opt out of this Arbitration Agreement within 30 days of first becoming subject to it by writing to the address above with your name, address, and a clear statement that you want to opt out.',
                'Batch Arbitration: 100+ substantially similar individual Requests filed within 30 days may be administered in batches of 100 by JAMS.',
              ]} />
            </SubSection>
            <SubSection number="10.3." title="Export">
              <p>
                The Site may be subject to U.S. export control laws. You agree not to export, reexport, or transfer,
                directly or indirectly, any U.S. technical data acquired from Company in violation of the United States
                export laws or regulations.
              </p>
            </SubSection>
            <SubSection number="10.4." title="Disclosures">
              <p>
                If you are a California resident, you may report complaints to the Complaint Assistance Unit of the Division
                of Consumer Product of the California Department of Consumer Affairs by contacting them in writing at
                400 R Street, Sacramento, CA 95814, or by telephone at (800) 952-5210.
              </p>
            </SubSection>
            <SubSection number="10.5." title="Electronic Communications">
              <p>
                For contractual purposes, you (a) consent to receive communications from Company in an electronic form;
                and (b) agree that all terms and conditions, agreements, notices, disclosures, and other communications
                that Company provides to you electronically satisfy any legal requirement that such communications would
                satisfy if it were in a hardcopy writing.
              </p>
            </SubSection>
            <SubSection number="10.6." title="Entire Terms">
              <p>
                These Terms constitute the entire agreement between you and us regarding the use of the Site. If any
                provision of these Terms is held to be invalid or unenforceable, the other provisions of these Terms will
                be unimpaired and the invalid or unenforceable provision will be deemed modified so that it is valid and
                enforceable to the maximum extent permitted by law. Your relationship to Company is that of an independent
                contractor. These Terms, and your rights and obligations herein, may not be assigned, subcontracted,
                delegated, or otherwise transferred by you without Company's prior written consent.
              </p>
            </SubSection>
            <SubSection number="10.7." title="Copyright/Trademark Information">
              <p>
                Copyright © {currentYear} TOP 100 Aerospace & Aviation Corporation. All rights reserved. All trademarks, logos and
                service marks displayed on the Site are our property or the property of other third parties. You are not
                permitted to use these Marks without our prior written consent or the consent of such third party which may
                own the Marks.
              </p>
            </SubSection>
            <SubSection number="10.8." title="Contact Information">
              <ContactCard />
            </SubSection>
          </PolicySection>

        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-[--brand-navy] transition-all hover:scale-105 hover:opacity-90"
          >
            Back to Home
          </Link>
          <Link
            to="/PrivacyPolicy"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-white bg-[--brand-gold] transition-all hover:scale-105 hover:opacity-90"
          >
            View Privacy Policy
          </Link>
        </div>

      </main>
    </div>
  );
}