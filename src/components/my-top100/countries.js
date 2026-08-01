// Shared, normalized country list for location selection across the Top 100 app.

export const COUNTRIES = [
  { name: 'Afghanistan', code: 'AF' }, { name: 'Albania', code: 'AL' }, { name: 'Algeria', code: 'DZ' },
  { name: 'Argentina', code: 'AR' }, { name: 'Armenia', code: 'AM' }, { name: 'Australia', code: 'AU' },
  { name: 'Austria', code: 'AT' }, { name: 'Azerbaijan', code: 'AZ' }, { name: 'Bahrain', code: 'BH' },
  { name: 'Bangladesh', code: 'BD' }, { name: 'Belarus', code: 'BY' }, { name: 'Belgium', code: 'BE' },
  { name: 'Bolivia', code: 'BO' }, { name: 'Bosnia and Herzegovina', code: 'BA' }, { name: 'Brazil', code: 'BR' },
  { name: 'Brunei', code: 'BN' }, { name: 'Bulgaria', code: 'BG' }, { name: 'Cambodia', code: 'KH' },
  { name: 'Cameroon', code: 'CM' }, { name: 'Canada', code: 'CA' }, { name: 'Chile', code: 'CL' },
  { name: 'China', code: 'CN' }, { name: 'Colombia', code: 'CO' }, { name: 'Costa Rica', code: 'CR' },
  { name: 'Croatia', code: 'HR' }, { name: 'Cuba', code: 'CU' }, { name: 'Cyprus', code: 'CY' },
  { name: 'Czech Republic', code: 'CZ' }, { name: 'Denmark', code: 'DK' }, { name: 'Dominican Republic', code: 'DO' },
  { name: 'Ecuador', code: 'EC' }, { name: 'Egypt', code: 'EG' }, { name: 'El Salvador', code: 'SV' },
  { name: 'Estonia', code: 'EE' }, { name: 'Ethiopia', code: 'ET' }, { name: 'Finland', code: 'FI' },
  { name: 'France', code: 'FR' }, { name: 'Georgia', code: 'GE' }, { name: 'Germany', code: 'DE' },
  { name: 'Ghana', code: 'GH' }, { name: 'Greece', code: 'GR' }, { name: 'Guatemala', code: 'GT' },
  { name: 'Honduras', code: 'HN' }, { name: 'Hong Kong', code: 'HK' }, { name: 'Hungary', code: 'HU' },
  { name: 'Iceland', code: 'IS' }, { name: 'India', code: 'IN' }, { name: 'Indonesia', code: 'ID' },
  { name: 'Iran', code: 'IR' }, { name: 'Iraq', code: 'IQ' }, { name: 'Ireland', code: 'IE' },
  { name: 'Israel', code: 'IL' }, { name: 'Italy', code: 'IT' }, { name: 'Jamaica', code: 'JM' },
  { name: 'Japan', code: 'JP' }, { name: 'Jordan', code: 'JO' }, { name: 'Kazakhstan', code: 'KZ' },
  { name: 'Kenya', code: 'KE' }, { name: 'Kuwait', code: 'KW' }, { name: 'Latvia', code: 'LV' },
  { name: 'Lebanon', code: 'LB' }, { name: 'Libya', code: 'LY' }, { name: 'Lithuania', code: 'LT' },
  { name: 'Luxembourg', code: 'LU' }, { name: 'Malaysia', code: 'MY' }, { name: 'Mexico', code: 'MX' },
  { name: 'Morocco', code: 'MA' }, { name: 'Myanmar', code: 'MM' }, { name: 'Nepal', code: 'NP' },
  { name: 'Netherlands', code: 'NL' }, { name: 'New Zealand', code: 'NZ' }, { name: 'Nicaragua', code: 'NI' },
  { name: 'Nigeria', code: 'NG' }, { name: 'North Macedonia', code: 'MK' }, { name: 'Norway', code: 'NO' },
  { name: 'Oman', code: 'OM' }, { name: 'Pakistan', code: 'PK' }, { name: 'Panama', code: 'PA' },
  { name: 'Paraguay', code: 'PY' }, { name: 'Peru', code: 'PE' }, { name: 'Philippines', code: 'PH' },
  { name: 'Poland', code: 'PL' }, { name: 'Portugal', code: 'PT' }, { name: 'Qatar', code: 'QA' },
  { name: 'Romania', code: 'RO' }, { name: 'Russia', code: 'RU' }, { name: 'Saudi Arabia', code: 'SA' },
  { name: 'Senegal', code: 'SN' }, { name: 'Serbia', code: 'RS' }, { name: 'Singapore', code: 'SG' },
  { name: 'Slovakia', code: 'SK' }, { name: 'Slovenia', code: 'SI' }, { name: 'South Africa', code: 'ZA' },
  { name: 'South Korea', code: 'KR' }, { name: 'Spain', code: 'ES' }, { name: 'Sri Lanka', code: 'LK' },
  { name: 'Sweden', code: 'SE' }, { name: 'Switzerland', code: 'CH' }, { name: 'Taiwan', code: 'TW' },
  { name: 'Tanzania', code: 'TZ' }, { name: 'Thailand', code: 'TH' }, { name: 'Tunisia', code: 'TN' },
  { name: 'Turkey', code: 'TR' }, { name: 'Uganda', code: 'UG' }, { name: 'Ukraine', code: 'UA' },
  { name: 'United Arab Emirates', code: 'AE' }, { name: 'United Kingdom', code: 'GB' },
  { name: 'United States', code: 'US' }, { name: 'Uruguay', code: 'UY' }, { name: 'Uzbekistan', code: 'UZ' },
  { name: 'Venezuela', code: 'VE' }, { name: 'Vietnam', code: 'VN' }, { name: 'Zimbabwe', code: 'ZW' },
];

// Parse a stored location string (comma-joined) into primary + secondaries,
// keeping only recognized country names so locations stay normalized.
export function parseLocations(value) {
  if (!value || typeof value !== 'string') return { primary: '', secondaries: [] };
  const valid = value
    .split(',')
    .map((s) => s.trim())
    .filter((p) => p && COUNTRIES.some((c) => c.name === p));
  if (valid.length === 0) return { primary: '', secondaries: [] };
  return { primary: valid[0], secondaries: valid.slice(1) };
}