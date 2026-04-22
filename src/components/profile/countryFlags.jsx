// Maps country name → ISO 3166-1 alpha-2 code for flag emoji
const COUNTRY_CODES = {
  'afghanistan': 'AF', 'albania': 'AL', 'algeria': 'DZ', 'argentina': 'AR', 'armenia': 'AM',
  'australia': 'AU', 'austria': 'AT', 'azerbaijan': 'AZ', 'bahrain': 'BH', 'bangladesh': 'BD',
  'belarus': 'BY', 'belgium': 'BE', 'bolivia': 'BO', 'bosnia': 'BA', 'brazil': 'BR',
  'brunei': 'BN', 'bulgaria': 'BG', 'cambodia': 'KH', 'cameroon': 'CM', 'canada': 'CA',
  'chile': 'CL', 'china': 'CN', 'colombia': 'CO', 'costa rica': 'CR', 'croatia': 'HR',
  'cuba': 'CU', 'cyprus': 'CY', 'czech republic': 'CZ', 'czechia': 'CZ', 'denmark': 'DK',
  'dominican republic': 'DO', 'ecuador': 'EC', 'egypt': 'EG', 'el salvador': 'SV',
  'estonia': 'EE', 'ethiopia': 'ET', 'finland': 'FI', 'france': 'FR', 'georgia': 'GE',
  'germany': 'DE', 'ghana': 'GH', 'greece': 'GR', 'guatemala': 'GT', 'honduras': 'HN',
  'hong kong': 'HK', 'hungary': 'HU', 'iceland': 'IS', 'india': 'IN', 'indonesia': 'ID',
  'iran': 'IR', 'iraq': 'IQ', 'ireland': 'IE', 'israel': 'IL', 'italy': 'IT',
  'jamaica': 'JM', 'japan': 'JP', 'jordan': 'JO', 'kazakhstan': 'KZ', 'kenya': 'KE',
  'korea': 'KR', 'south korea': 'KR', 'kuwait': 'KW', 'latvia': 'LV', 'lebanon': 'LB',
  'libya': 'LY', 'lithuania': 'LT', 'luxembourg': 'LU', 'malaysia': 'MY', 'mexico': 'MX',
  'morocco': 'MA', 'myanmar': 'MM', 'nepal': 'NP', 'netherlands': 'NL', 'new zealand': 'NZ',
  'nicaragua': 'NI', 'nigeria': 'NG', 'north macedonia': 'MK', 'norway': 'NO', 'oman': 'OM',
  'pakistan': 'PK', 'panama': 'PA', 'paraguay': 'PY', 'peru': 'PE', 'philippines': 'PH',
  'poland': 'PL', 'portugal': 'PT', 'qatar': 'QA', 'romania': 'RO', 'russia': 'RU',
  'saudi arabia': 'SA', 'senegal': 'SN', 'serbia': 'RS', 'singapore': 'SG', 'slovakia': 'SK',
  'slovenia': 'SI', 'south africa': 'ZA', 'spain': 'ES', 'sri lanka': 'LK', 'sweden': 'SE',
  'switzerland': 'CH', 'taiwan': 'TW', 'tanzania': 'TZ', 'thailand': 'TH', 'tunisia': 'TN',
  'turkey': 'TR', 'turkiye': 'TR', 'uae': 'AE', 'united arab emirates': 'AE', 'uganda': 'UG',
  'ukraine': 'UA', 'united kingdom': 'GB', 'uk': 'GB', 'united states': 'US', 'usa': 'US',
  'us': 'US', 'uruguay': 'UY', 'uzbekistan': 'UZ', 'venezuela': 'VE', 'vietnam': 'VN',
  'zimbabwe': 'ZW',
};

// Primary flag colors for accent stripe on card
const COUNTRY_COLORS = {
  'US': ['#B22234', '#3C3B6E'], 'GB': ['#C8102E', '#012169'], 'CA': ['#FF0000', '#FFFFFF'],
  'FR': ['#002395', '#ED2939'], 'DE': ['#000000', '#DD0000', '#FFCC00'], 'IT': ['#008C45', '#CD212A'],
  'ES': ['#AA151B', '#F1BF00'], 'JP': ['#BC002D', '#FFFFFF'], 'CN': ['#DE2910', '#FFDE00'],
  'IN': ['#FF9933', '#138808'], 'BR': ['#009C3B', '#FFDF00'], 'AU': ['#00008B', '#FFFFFF'],
  'KR': ['#003478', '#CD2E3A'], 'MX': ['#006847', '#CE1126'], 'IL': ['#0038b8', '#FFFFFF'],
  'SA': ['#006C35', '#FFFFFF'], 'AE': ['#00732F', '#FF0000'], 'ZA': ['#007749', '#FFB81C'],
  'NG': ['#008751', '#FFFFFF'], 'EG': ['#CE1126', '#000000'], 'SE': ['#006AA7', '#FECC02'],
  'NO': ['#BA0C2F', '#00205B'], 'DK': ['#C8102E', '#FFFFFF'], 'FI': ['#003580', '#FFFFFF'],
  'NL': ['#AE1C28', '#21468B'], 'PL': ['#DC143C', '#FFFFFF'], 'TR': ['#E30A17', '#FFFFFF'],
  'RU': ['#0039A6', '#D52B1E'], 'UA': ['#005BBB', '#FFD500'], 'PT': ['#006600', '#FF0000'],
  'GR': ['#0D5EAF', '#FFFFFF'], 'IE': ['#169B62', '#FF883E'], 'AT': ['#ED2939', '#FFFFFF'],
  'CH': ['#FF0000', '#FFFFFF'], 'BE': ['#000000', '#FDDA24', '#EF3340'],
  'NZ': ['#00247D', '#CC142B'], 'SG': ['#EF3340', '#FFFFFF'], 'PH': ['#0038A8', '#CE1126'],
  'TH': ['#A51931', '#2D2A4A'], 'MY': ['#010066', '#CC0001'], 'ID': ['#FF0000', '#FFFFFF'],
  'VN': ['#DA251D', '#FFCD00'], 'PK': ['#01411C', '#FFFFFF'], 'CL': ['#D52B1E', '#0039A6'],
  'CO': ['#FCD116', '#003893', '#CE1126'], 'AR': ['#74ACDF', '#F6B40E'], 'PE': ['#D91023', '#FFFFFF'],
};

export function getCountryCode(location) {
  if (!location) return null;
  const lower = location.toLowerCase().trim();
  // Try exact match first
  if (COUNTRY_CODES[lower]) return COUNTRY_CODES[lower];
  // Try matching the last part after comma (e.g. "San Francisco, USA")
  const parts = lower.split(',').map(s => s.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    if (COUNTRY_CODES[parts[i]]) return COUNTRY_CODES[parts[i]];
  }
  // Fuzzy: check if any country name is contained
  for (const [name, code] of Object.entries(COUNTRY_CODES)) {
    if (lower.includes(name)) return code;
  }
  return null;
}

export function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return null;
  const cc = countryCode.toUpperCase();
  return String.fromCodePoint(...[...cc].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

export function getCountryColors(countryCode) {
  if (!countryCode) return null;
  return COUNTRY_COLORS[countryCode.toUpperCase()] || null;
}