/** Limit parallel CMS API calls — Namecheap/Node drops bursts with net::ERR_FAILED. */

const MAX_CONCURRENT = 2;
let active = 0;
const waiters: Array<() => void> = [];

async function acquire(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  active += 1;
}

function release(): void {
  active = Math.max(0, active - 1);
  const next = waiters.shift();
  if (next) next();
}

export type PublicFetchInit = RequestInit & {
  retries?: number;
};

/** Queued fetch with retries for public CMS JSON.
 * Do NOT send custom headers like Pragma — they trigger CORS preflight
 * and Namecheap only allows Content-Type / Authorization. */
export async function publicCmsFetch(
  input: string,
  init: PublicFetchInit = {}
): Promise<Response> {
  const retries = init.retries ?? 2;
  const { retries: _r, headers: _ignoredHeaders, ...rest } = init;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    await acquire();
    try {
      const response = await fetch(input, {
        ...rest,
        cache: "no-store",
        mode: "cors",
        // No custom headers — keeps this a "simple" GET (no preflight).
        headers: undefined,
      });
      release();
      return response;
    } catch (err) {
      release();
      lastError = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error("Failed to fetch CMS content");
}
