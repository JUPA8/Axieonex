import { TransitionLink } from "@/components/transition/TransitionLink";
import { CONTACT_EMAIL } from "@/lib/site";
import type { LegalSection } from "@/components/legal/LegalPageLayout";

export const TERMS_LAST_UPDATED = "[DATE TO BE CONFIRMED]";
export const TERMS_WARNING =
  "This page is a structural framework, not a finished contract. It requires review and completion by qualified legal counsel and approval by the business owner, and every bracketed value below must be confirmed, before it is published or relied on.";

export const TERMS_SECTIONS: LegalSection[] = [
  {
    id: "acceptance",
    tocLabel: "Acceptance of terms",
    heading: "1. Acceptance of terms",
    body: (
      <p>
        By accessing or using this website, you agree to these Terms of Service. If you do not agree, you should not
        use the site. These terms apply to your use of the website itself, separately from any signed commercial
        agreement described in Section 4.
      </p>
    ),
  },
  {
    id: "eligibility",
    tocLabel: "Eligibility and scope",
    heading: "2. Eligibility and business-use scope",
    body: (
      <p>
        This website and its services are intended for business use by companies and professionals evaluating or
        engaging Axieonex, not for consumer use. By using this site, you represent that you are acting in a business
        capacity.
      </p>
    ),
  },
  {
    id: "services",
    tocLabel: "Our services",
    heading: "3. Description of Axieonex services",
    body: (
      <p>
        Axieonex provides AI-orchestrated, human-executed outbound revenue services, including signal-based lead
        generation, appointment setting, hybrid SDR services, cold email and messaging, LinkedIn outreach, cold
        calling, and pre-sales and go-to-market strategy, as described on this website. Descriptions on this site
        are general and informational and do not themselves constitute a binding service commitment.
      </p>
    ),
  },
  {
    id: "contracts",
    tocLabel: "Website terms vs. contracts",
    heading: "4. Relationship between these terms and signed agreements",
    body: (
      <p>
        These website Terms of Service govern your use of the website only. Any actual engagement for services is
        governed by a separate signed proposal, contract, or statement of work agreed directly between you and
        Axieonex, which will set out scope, deliverables, fees, timelines, and any service commitments. Where these
        website terms and a signed agreement conflict, the signed agreement controls for that engagement.
      </p>
    ),
  },
  {
    id: "client-responsibilities",
    tocLabel: "Client responsibilities",
    heading: "5. Client responsibilities and information accuracy",
    body: (
      <p>
        If you submit information through this site, such as through the Contact or Strategy Call forms, you are
        responsible for the accuracy of the information you provide and for having the authority to provide it. You
        are responsible for ensuring that any target audience, messaging content, or outreach approvals you provide
        comply with applicable laws in your relevant markets.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    tocLabel: "Acceptable use",
    heading: "6. Acceptable use",
    body: (
      <>
        <ul className="list-disc pl-5">
          <li>Do not use this site to transmit unlawful, infringing, or malicious content.</li>
          <li>Do not attempt to interfere with the security or normal operation of the site.</li>
          <li>Do not scrape, reverse engineer, or misuse site content beyond normal browsing and legitimate business enquiry.</li>
          <li>Do not misrepresent your identity or authority when submitting a form.</li>
        </ul>
        <p>
          Any outreach, communications, and data-handling responsibilities specific to an active engagement (such as
          compliance with applicable anti-spam or telemarketing law in your target markets) will be addressed in the
          signed agreement referenced in Section 4.
        </p>
      </>
    ),
  },
  {
    id: "ip",
    tocLabel: "Intellectual property",
    heading: "7. Intellectual property",
    body: (
      <p>
        The Axieonex name, logo, website content, and materials are the property of Axieonex or its licensors,
        except where noted otherwise. Materials, data, or approvals you provide to us for use in an engagement
        remain your property; our license to use them is limited to the purposes agreed in the relevant contract.
      </p>
    ),
  },
  {
    id: "confidentiality",
    tocLabel: "Confidentiality",
    heading: "8. Confidentiality",
    body: (
      <p>
        Information shared through this website, including through the Contact and Strategy Call forms, is treated
        as confidential business information and used only to respond to your enquiry, consistent with our{" "}
        <TransitionLink href="/privacy" className="underline">Privacy Policy</TransitionLink>. Detailed mutual
        confidentiality obligations for an active engagement are set out in the signed agreement.
      </p>
    ),
  },
  {
    id: "third-party",
    tocLabel: "Third-party services",
    heading: "9. Third-party services and integrations",
    body: (
      <p>
        This site or an active engagement may rely on third-party tools such as scheduling, email, or CRM providers.
        The specific providers in use are [THIRD-PARTY PROVIDER LIST TO BE CONFIRMED]. We are not responsible for the
        availability or practices of third-party services beyond our reasonable control.
      </p>
    ),
  },
  {
    id: "fees",
    tocLabel: "Fees and payment",
    heading: "10. Fees, payment, and cancellation principles",
    body: (
      <p>
        This website does not display or commit to specific pricing. Fees, payment terms, invoicing schedule,
        renewal terms, and cancellation terms for any engagement are agreed in the signed proposal or contract
        referenced in Section 4, and are [COMMERCIAL TERMS TO BE CONFIRMED PER AGREEMENT]. No refund, renewal, or
        cancellation policy is stated here.
      </p>
    ),
  },
  {
    id: "changes-suspension",
    tocLabel: "Changes, suspension, termination",
    heading: "11. Service changes, suspension, and termination",
    body: (
      <p>
        We may update, modify, or discontinue parts of this website at any time. Suspension or termination terms for
        an active service engagement are governed by the signed agreement for that engagement, not by this page.
      </p>
    ),
  },
  {
    id: "disclaimers",
    tocLabel: "Disclaimers and liability",
    heading: "12. Disclaimers and limitation of liability",
    body: (
      <>
        <p>
          This website and its content are provided on an as-is basis, without warranties of any kind, to the extent
          permitted by law. Axieonex does not guarantee specific results, meetings booked, response rates,
          deliverability, revenue outcomes, or uninterrupted availability of the website.
        </p>
        <p>
          To the extent permitted by law, Axieonex&apos;s liability arising from use of this website is limited; the
          specific liability cap and framework applicable to a service engagement will be set out in the signed
          agreement and is [LIABILITY FRAMEWORK TO BE CONFIRMED BY COUNSEL].
        </p>
      </>
    ),
  },
  {
    id: "indemnification",
    tocLabel: "Indemnification",
    heading: "13. Indemnification",
    body: (
      <p>
        You agree to indemnify Axieonex against claims arising from your misuse of this website or breach of these
        terms, to the extent permitted by law. The full indemnification framework applicable to a service engagement
        is [INDEMNIFICATION FRAMEWORK TO BE CONFIRMED BY COUNSEL] and will be set out in the signed agreement.
      </p>
    ),
  },
  {
    id: "governing-law",
    tocLabel: "Governing law",
    heading: "14. Governing law and dispute resolution",
    body: (
      <p>
        The governing law, jurisdiction, and dispute-resolution process (including any arbitration) applicable to
        these terms are [GOVERNING LAW AND JURISDICTION TO BE CONFIRMED BY COUNSEL].
      </p>
    ),
  },
  {
    id: "general",
    tocLabel: "General provisions",
    heading: "15. General provisions",
    body: (
      <>
        <p>
          <strong className="text-ax-text-primary">Force majeure.</strong> Neither party is liable for delay or
          failure caused by events beyond reasonable control.
        </p>
        <p>
          <strong className="text-ax-text-primary">Severability.</strong> If any provision of these terms is found
          unenforceable, the remaining provisions continue in effect.
        </p>
        <p>
          <strong className="text-ax-text-primary">Assignment.</strong> These terms may not be assigned by you
          without our consent; Axieonex may assign these terms in connection with a merger, acquisition, or sale of
          assets.
        </p>
        <p>
          <strong className="text-ax-text-primary">Entire agreement and precedence.</strong> For website use, these
          terms represent the entire agreement between you and Axieonex regarding the site, superseded for a
          specific engagement by the signed agreement described in Section 4.
        </p>
        <p>
          <strong className="text-ax-text-primary">Changes to these terms.</strong> We may update these terms from
          time to time. Material changes will be reflected by updating the date at the top of this page. The formal
          update and notification procedure is [POLICY UPDATE PROCEDURE TO BE CONFIRMED].
        </p>
      </>
    ),
  },
  {
    id: "contact-us",
    tocLabel: "Contact us",
    heading: "16. Contact us",
    body: (
      <p>
        Questions about these terms can be sent to {CONTACT_EMAIL}. See also our{" "}
        <TransitionLink href="/privacy" className="underline">Privacy Policy</TransitionLink> and{" "}
        <TransitionLink href="/cookies" className="underline">Cookies Policy</TransitionLink>.
      </p>
    ),
  },
];
