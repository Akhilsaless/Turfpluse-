/**
 * Optional deployment overrides, not startup requirements.
 * Ordinary defaults belong in code; only real credentials belong in Secrets.
 * An absent value deliberately keeps the corresponding integration disabled.
 */
export function optionalSetting(name: string): string | undefined {
  const value = process.env[name];
  return value?.trim() ? value : undefined;
}
