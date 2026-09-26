import type { ProviderOperationState } from "@prisma/client";
import { formatAdminDate, providerStatePresentation } from "@/lib/adminPresentation";

export function ProviderStateDisplay({
  state,
  stateUpdatedAt,
  successAt,
}: {
  state: ProviderOperationState;
  stateUpdatedAt: Date | null;
  successAt: Date | null;
}) {
  const presentation = providerStatePresentation(state);
  return (
    <div className="space-y-1">
      <p className="font-semibold text-ax-text-primary">{presentation.label}</p>
      <p className="text-sm leading-relaxed text-ax-text-muted">{presentation.description}</p>
      {successAt ? <p className="text-sm text-ax-text-muted">Succeeded: {formatAdminDate(successAt)}</p> : null}
      {stateUpdatedAt ? <p className="text-sm text-ax-text-muted">State recorded: {formatAdminDate(stateUpdatedAt)}</p> : null}
    </div>
  );
}
