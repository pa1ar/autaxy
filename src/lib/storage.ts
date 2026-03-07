export interface BusinessSettings {
  companyName: string;
  street: string;
  zipCity: string;
  country: string;
  vatId: string;
  appleVendorId: string;
  contactEmail: string;
}

const STORAGE_KEY = 'autaxy_business_settings';

export const defaultSettings: BusinessSettings = {
  companyName: '',
  street: '',
  zipCity: '',
  country: 'Germany',
  vatId: '',
  appleVendorId: '',
  contactEmail: '',
};

export function loadSettings(): BusinessSettings {
  if (typeof window === 'undefined') return defaultSettings;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(stored) };
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: BusinessSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function hasSettings(): boolean {
  const settings = loadSettings();
  return Boolean(settings.companyName && settings.street && settings.zipCity);
}

const URL_PARAM_MAP: Record<string, keyof BusinessSettings> = {
  company: 'companyName',
  street: 'street',
  zip: 'zipCity',
  country: 'country',
  vat: 'vatId',
  vendor: 'appleVendorId',
  email: 'contactEmail',
};

export function parseSettingsFromUrl(): Partial<BusinessSettings> | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const overrides: Partial<BusinessSettings> = {};
  let found = false;
  for (const [param, field] of Object.entries(URL_PARAM_MAP)) {
    const value = params.get(param);
    if (value !== null) {
      overrides[field] = value;
      found = true;
    }
  }
  return found ? overrides : null;
}

export function buildSettingsUrl(settings: BusinessSettings): string {
  const params = new URLSearchParams();
  for (const [param, field] of Object.entries(URL_PARAM_MAP)) {
    const value = settings[field];
    if (value && value !== defaultSettings[field]) {
      params.set(param, value);
    }
  }
  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function clearUrlParams(): void {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (url.search) {
    url.search = '';
    window.history.replaceState({}, '', url.pathname);
  }
}
