import { TransitionLink } from "@/components/transition/TransitionLink";
import { CONTACT_EMAIL } from "@/lib/site";
import type { LegalSection } from "@/components/legal/LegalPageLayout";

export const PRIVACY_LAST_UPDATED = "[DATE TO BE CONFIRMED]";
export const PRIVACY_WARNING =
  "This page is a structural draft. It requires review by a qualified lawyer, and every bracketed value below must be confirmed, before it is published or relied on.";

export const PRIVACY_SECTIONS: LegalSection[] = [
  {
    id: "controller",
    tocLabel: "Data controller",
    heading: "1. Data controller",
    body: (
      <>
        <p>
          This website is operated by Axieonex Sales. The controller&apos;s full registered legal name, registration
          number and registered address are [LEGAL ENTITY DETAILS TO BE CONFIRMED]. For any privacy question, contact{" "}
          {CONTACT_EMAIL}.
        </p>
        <p>Whether a Data Protection Officer is appointed, and their contact details if so, is [DPO STATUS TO BE CONFIRMED].</p>
      </>
    ),
  },
  {
    id: "data-we-collect",
    tocLabel: "Data we collect",
    heading: "2. Categories of personal data we collect",
    body: (
      <>
        <p>
          <strong className="text-ax-text-primary">Contact form.</strong> Full name, business email, company, message
          content and enquiry purpose.
        </p>
        <p>
          <strong className="text-ax-text-primary">Strategy Call booking.</strong> Full name, business email, phone
          number, role, company name, company website, country, company size, current outbound approach, desired
          outcome, target market and preferred engagement range.
        </p>
        <p>
          <strong className="text-ax-text-primary">Technical and usage data.</strong> IP address, browser and device
          type, pages visited, referring pages and approximate timestamps, collected automatically as you use the
          site.
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    tocLabel: "Cookies",
    heading: "3. Cookies and similar technologies",
    body: (
      <p>
        The site uses cookies and similar technologies for essential site function and, where you consent, analytics
        and marketing purposes. See the <TransitionLink href="/cookies" className="underline">Cookies Policy</TransitionLink> for the categories used and{" "}
        <TransitionLink href="/cookie-preferences" className="underline">Cookie Preferences</TransitionLink> to manage
        your choices. The specific analytics and marketing tools in use are [ANALYTICS AND MARKETING TOOLING TO BE
        CONFIRMED].
      </p>
    ),
  },
  {
    id: "purposes",
    tocLabel: "Purposes and legal bases",
    heading: "4. Purposes of processing and legal bases",
    body: (
      <>
        <ul className="list-disc pl-5">
          <li>Responding to enquiries and Strategy Call requests, based on taking steps at your request prior to a contract.</li>
          <li>Operating and securing the website, based on our legitimate interest in running a functioning, secure service.</li>
          <li>Sending information you have requested, based on your consent or our legitimate interest in responding to your enquiry.</li>
          <li>Analytics and marketing cookies, based on your consent, given or withdrawn through Cookie Preferences.</li>
          <li>Complying with legal obligations that apply to us.</li>
        </ul>
        <p>
          We do not claim this processing automatically satisfies every requirement of the GDPR or any other
          data-protection law. The legal-basis assessment above requires review by qualified counsel before
          publication.
        </p>
      </>
    ),
  },
  {
    id: "processors",
    tocLabel: "Processors and transfers",
    heading: "5. Data processors, service providers and international transfers",
    body: (
      <>
        <p>
          Form submissions and booking requests may be processed by third-party email, CRM, and scheduling providers.
          The specific providers, their locations and their data-processing agreements are [SERVICE PROVIDER LIST TO
          BE CONFIRMED].
        </p>
        <p>
          Where data is transferred outside your country or region, the safeguard used (such as Standard Contractual
          Clauses or an adequacy decision) is [INTERNATIONAL TRANSFER SAFEGUARDS TO BE CONFIRMED].
        </p>
      </>
    ),
  },
  {
    id: "retention",
    tocLabel: "Retention and security",
    heading: "6. Data retention and security",
    body: (
      <>
        <p>
          We retain personal data only for as long as needed for the purposes described above, or as required by
          law. The specific retention periods for enquiry, booking and technical data are [RETENTION PERIODS TO BE
          CONFIRMED].
        </p>
        <p>
          We apply technical and organizational measures intended to protect personal data against unauthorized
          access, loss or misuse. The specific measures in place (encryption, access controls, hosting security) are
          [SECURITY MEASURES TO BE CONFIRMED] and should be documented here before launch.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    tocLabel: "Your rights",
    heading: "7. Your rights",
    body: (
      <>
        <p>
          Subject to applicable law, you may have the right to access, correct, delete or restrict the personal data
          we hold about you, to receive a copy of it in a portable format, to object to processing based on
          legitimate interest, and to withdraw consent at any time without affecting processing carried out before
          withdrawal.
        </p>
        <p>
          You also have the right to lodge a complaint with your local data-protection supervisory authority. To
          exercise any of these rights, contact {CONTACT_EMAIL}.
        </p>
      </>
    ),
  },
  {
    id: "automated",
    tocLabel: "Automated decisions",
    heading: "8. Automated decision-making",
    body: (
      <p>
        We do not use your personal data to make decisions with legal or similarly significant effects on you through
        automated means without human involvement. Internal lead-scoring and signal-detection systems inform which
        accounts we contact; they do not make final decisions about individuals.
      </p>
    ),
  },
  {
    id: "children",
    tocLabel: "Children's privacy",
    heading: "9. Children's privacy",
    body: (
      <p>
        This site is intended for business audiences and is not directed at children. We do not knowingly collect
        personal data from children.
      </p>
    ),
  },
  {
    id: "changes",
    tocLabel: "Changes to this policy",
    heading: "10. Changes to this policy",
    body: (
      <p>
        We may update this policy from time to time. Material changes will be reflected by updating the date at the
        top of this page. The formal update and notification procedure is [POLICY UPDATE PROCEDURE TO BE CONFIRMED].
      </p>
    ),
  },
  {
    id: "contact-us",
    tocLabel: "Contact us",
    heading: "11. Contact us",
    body: (
      <p>
        Questions about this policy or your personal data can be sent to {CONTACT_EMAIL}. See also our{" "}
        <TransitionLink href="/cookies" className="underline">Cookies Policy</TransitionLink>,{" "}
        <TransitionLink href="/terms" className="underline">Terms of Service</TransitionLink> and{" "}
        <TransitionLink href="/cookie-preferences" className="underline">Cookie Preferences</TransitionLink>.
      </p>
    ),
  },
];
