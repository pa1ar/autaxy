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
