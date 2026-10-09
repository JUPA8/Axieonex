/**
 * Whether this deployment may be indexed by search engines.
 *
 * The site started on Vercel, where "is this a preview?" was answered by
 * VERCEL_ENV and protected deployments were additionally shielded by the
 * platform's own authentication layer. Neither of those exists on another
 * host, so a deployment elsewhere would have emitted no noindex signal at all
 * and gone straight into search results.
 *
 * The rule is therefore: indexing is off unless something explicitly turns it
 * on. SITE_INDEXING_ENABLED=true is that switch, and because it is read at
 * request time on the server and baked into robots.txt at build time, turning
 * it on takes an environment change plus a fresh deployment. The established
 * Vercel behaviour is preserved verbatim when the switch is absent, so the
 * Vercel project stays usable as an unchanged rollback reference.
 */
export type IndexingInputs = {
  /** SITE_INDEXING_ENABLED: "true" opts in, "false" opts out, absent defers. */
  switchValue?: string;
  /** VERCEL_ENV, present only on Vercel. */
  deploymentEnvironment?: string;
};

export function isIndexingEnabled({
  switchValue = process.env.SITE_INDEXING_ENABLED,
  deploymentEnvironment = process.env.VERCEL_ENV,
}: IndexingInputs = {}): boolean {
  const explicit = switchValue?.trim().toLowerCase();
  if (explicit === "true") return true;
  if (explicit === "false") return false;

  // No switch set. Reproduce exactly what Vercel did before this existed:
  // previews were noindex, production was left indexable.
  if (deploymentEnvironment === "production") return true;
  if (deploymentEnvironment === "preview") return false;

  // Anywhere else (Netlify, a container, a laptop) the safe answer is no.
  return false;
}
