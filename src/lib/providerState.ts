import type { ProviderOperationState } from "@prisma/client";

export type ProviderFailureReason = "not_configured" | "misconfigured" | "timeout" | "provider_error";

export function providerStateFromResult(succeeded: boolean, reason?: ProviderFailureReason): ProviderOperationState {
  if (succeeded) return "SUCCEEDED";
  return reason === "not_configured" ? "DISABLED" : "FAILED";
}

export const PROVIDER_STATE_LABELS: Record<ProviderOperationState, string> = {
  NOT_ATTEMPTED: "Not attempted",
  DISABLED: "Disabled / not configured",
  SUCCEEDED: "Succeeded",
  FAILED: "Failed",
  LEGACY_UNKNOWN: "Legacy / unknown",
};

export const PROVIDER_STATE_DESCRIPTIONS: Record<ProviderOperationState, string> = {
  NOT_ATTEMPTED: "No provider operation has been attempted for this record.",
  DISABLED: "The provider was not configured, so no external request was made.",
  SUCCEEDED: "Persisted provider-success evidence exists for this record.",
  FAILED: "The configured provider operation did not complete successfully.",
  LEGACY_UNKNOWN: "This record predates provider-state tracking and its prior outcome cannot be proven.",
};
