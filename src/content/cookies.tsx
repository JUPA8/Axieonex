import { TransitionLink } from "@/components/transition/TransitionLink";
import { CONTACT_EMAIL } from "@/lib/site";
import type { LegalSection } from "@/components/legal/LegalPageLayout";

export const COOKIES_LAST_UPDATED = "[DATE TO BE CONFIRMED]";
export const COOKIES_WARNING =
  "This page is a structural draft. It requires review by a qualified lawyer, and every bracketed value below must be confirmed against the final production cookie inventory, before it is published or relied on.";

export const COOKIES_SECTIONS: LegalSection[] = [
  {
    id: "what-are-cookies",
    tocLabel: "What cookies are",
    heading: "1. What cookies and similar technologies are",
    body: (
      <p>
        Cookies are small text files placed on your device when you visit a website. Similar technologies include
        local storage and pixels, which can serve comparable purposes. This policy explains the categories of
        cookies this site may use and why.
      </p>
    ),
  },
  {
    id: "categories",
    tocLabel: "Categories we use",
    heading: "2. Categories of cookies we use",
    body: (
      <>
        <p>
          <strong className="text-ax-text-primary">Strictly necessary.</strong> Required for core site function, such
          as navigation and security. These cannot be switched off and do not require consent.
        </p>
        <p>
          <strong className="text-ax-text-primary">Functional.</strong> Remember choices you make, such as cookie
          preferences, to improve your experience on return visits.
        </p>
        <p>
          <strong className="text-ax-text-primary">Analytics.</strong> Help us understand how visitors use the site,
          if and once an analytics tool is implemented. Used only with your consent.
        </p>
        <p>
          <strong className="text-ax-text-primary">Preferences.</strong> Store settings such as display or regional
          preferences where applicable.
        </p>
        <p>
          <strong className="text-ax-text-primary">Marketing.</strong> Used only if a marketing or advertising tool
          is implemented, and only with your consent, to measure or personalize communications.
        </p>
        <p>
          Whether analytics and marketing cookies are currently active on this site, and which specific tools are
          used, is [ANALYTICS AND MARKETING TOOLING TO BE CONFIRMED]. No optional cookie is described as active
          unless the underlying integration is verified.
        </p>
      </>
    ),
  },
  {
    id: "first-third-party",
    tocLabel: "First and third party",
    heading: "3. First-party and third-party cookies",
    body: (
      <p>
        First-party cookies are set directly by this site. Third-party cookies may be set by services embedded on
        the site, such as a scheduling tool used for Strategy Call bookings. The specific third-party providers in
        use, and their own cookie practices, are [THIRD-PARTY PROVIDER LIST TO BE CONFIRMED]; each provider&apos;s
        own privacy and cookie policy will govern their cookies.
      </p>
    ),
  },
  {
    id: "duration",
    tocLabel: "Duration and storage",
    heading: "4. Duration and storage",
    body: (
      <p>
        Session cookies are deleted when you close your browser. Persistent cookies remain for a set period or until
        manually deleted. The specific cookie names, purposes and retention durations in production use are
        maintained in a structured cookie inventory, held separately from this page, and are [COOKIE INVENTORY TO BE
        CONFIRMED AND PUBLISHED].
      </p>
    ),
  },
  {
    id: "consent",
    tocLabel: "Consent and legal basis",
    heading: "5. Consent and legal basis",
    body: (
      <p>
        Strictly necessary cookies are used on the basis of our legitimate interest in operating the site. All other
        categories are used only with your consent, collected and recorded through{" "}
        <TransitionLink href="/cookie-preferences" className="underline">Cookie Preferences</TransitionLink>. You may
        withdraw consent at any time by returning to that page.
      </p>
    ),
  },
  {
    id: "controls",
    tocLabel: "Managing cookies",
    heading: "6. Managing cookies",
    body: (
      <p>
        You can manage non-essential cookies for this site at any time through{" "}
        <TransitionLink href="/cookie-preferences" className="underline">Cookie Preferences</TransitionLink>. Most
        browsers also let you block or delete cookies through their settings; doing so may affect site functionality.
      </p>
    ),
  },
  {
    id: "transfers",
    tocLabel: "International providers",
    heading: "7. International providers",
    body: (
      <p>
        Where a cookie is set by a provider located outside your country or region, that provider&apos;s own
        data-transfer safeguards apply. The relevant providers and safeguards are [INTERNATIONAL PROVIDER DETAILS TO
        BE CONFIRMED]; see also our <TransitionLink href="/privacy" className="underline">Privacy Policy</TransitionLink>.
      </p>
    ),
  },
  {
    id: "changes",
    tocLabel: "Changes to this policy",
    heading: "8. Changes to this policy",
    body: (
      <p>
        We may update this policy as our cookie use changes. Material changes will be reflected by updating the date
        at the top of this page. The formal update and notification procedure is [POLICY UPDATE PROCEDURE TO BE
        CONFIRMED].
      </p>
    ),
  },
  {
    id: "contact-us",
    tocLabel: "Contact us",
    heading: "9. Contact us",
    body: (
      <p>
        Questions about this policy can be sent to {CONTACT_EMAIL}. See also our{" "}
        <TransitionLink href="/privacy" className="underline">Privacy Policy</TransitionLink> and{" "}
        <TransitionLink href="/cookie-preferences" className="underline">Cookie Preferences</TransitionLink>.
      </p>
    ),
  },
];
