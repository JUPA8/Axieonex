import { COMPARISON_ROWS, PRICING_TIERS } from "@/content/pricing";

export function ComparisonTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <caption className="mb-6 text-left text-[length:var(--ax-fs-h2-fluid)] font-bold tracking-tight">
          What changes between engagements
        </caption>
        <thead>
          <tr className="border-b border-white/10">
            <th scope="col" className="py-3 pr-4 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">
              &nbsp;
            </th>
            {PRICING_TIERS.map((tier) => (
              <th key={tier.name} scope="col" className="py-3 pr-4 text-[11px] font-semibold uppercase tracking-wide text-ax-text-muted">
                {tier.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {COMPARISON_ROWS.map((row) => (
            <tr key={row.label} className="border-b border-white/8">
              <th scope="row" className="py-4 pr-4 font-semibold text-ax-text-primary">
                {row.label}
              </th>
              {row.values.map((value, i) => (
                <td key={i} className="py-4 pr-4 text-ax-text-body">
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
