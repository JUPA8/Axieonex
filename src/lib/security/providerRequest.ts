import "server-only";

export const PROVIDER_TIMEOUT_MS = 5_000;

export class ProviderTimeoutError extends Error {
  constructor() {
    super("Provider request timed out.");
    this.name = "ProviderTimeoutError";
  }
}

export async function fetchWithTimeout(input: string | URL, init: RequestInit = {}, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new ProviderTimeoutError()), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) throw new ProviderTimeoutError();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function withTimeout<T>(promise: Promise<T>, timeoutMs = PROVIDER_TIMEOUT_MS): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new ProviderTimeoutError()), timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}
