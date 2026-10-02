// Log stable error codes only; provider messages and connection strings can
// contain secrets and must never be logged or sent to the browser.
export function logFailure(operation: string, error: unknown) {
  const code = (error as { code?: unknown } | null)?.code;
  console.error(JSON.stringify({
    operation,
    code: typeof code === "string" && /^[A-Z0-9_]{1,80}$/.test(code)
      ? code : "UNCLASSIFIED",
  }));
}
