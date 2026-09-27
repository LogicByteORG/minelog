const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU",
  "IE", "IT", "LV", "LT", "LU", "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES",
  "SE",
  "IS", "LI", "NO",
  "GB", "CH",
]);

export function countryOf(header: string | null): string | null {
  const code = header?.trim().toUpperCase() ?? "";
  if (!/^[A-Z]{2}$/.test(code) || code === "XX" || code === "T1") return null;
  return code;
}

export function analyticsAllowed(header: string | null): boolean {
  const country = countryOf(header);
  return country !== null && !CONSENT_COUNTRIES.has(country);
}

