import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ChevronsUpDown } from 'lucide-react';
import { loadSettings, saveSettings, type BusinessSettings as Settings } from '../lib/storage';
import { trackSettingsSaved } from '../lib/analytics';
import type { Language } from '../lib/i18n';
import { t } from '../lib/i18n';

interface BusinessSettingsProps {
  language: Language;
  onSettingsChange?: (settings: Settings) => void;
}

export function BusinessSettings({ language, onSettingsChange }: BusinessSettingsProps) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const handleChange = (field: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => ({ ...prev, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    trackSettingsSaved(Boolean(settings.vatId));
    onSettingsChange?.(settings);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader className="mb-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full flex items-center justify-between text-left"
        >
          <div>
            <CardTitle>{t('settingsTitle', language)}</CardTitle>
            <CardDescription>{t('settingsDescription', language)}</CardDescription>
          </div>
          <span className="collapse-toggle" aria-hidden="true">
            <ChevronsUpDown size={14} />
          </span>
        </button>
      </CardHeader>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className={expanded ? 'overflow-visible' : 'overflow-hidden'}>
          <CardContent className="pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label={t('companyName', language)}
              value={settings.companyName}
              onChange={handleChange('companyName')}
              placeholder="Muster GmbH"
            />
            <Input
              label={t('street', language)}
              value={settings.street}
              onChange={handleChange('street')}
              placeholder="Musterstr. 1"
            />
            <Input
              label={t('zipCity', language)}
              value={settings.zipCity}
              onChange={handleChange('zipCity')}
              placeholder="12345 Berlin"
            />
            <Input
              label={t('country', language)}
              value={settings.country}
              onChange={handleChange('country')}
              placeholder="Germany"
            />
            <Input
              label={t('vatId', language)}
              value={settings.vatId}
              onChange={handleChange('vatId')}
              placeholder="DE123456789"
            />
            <Input
              label={t('appleVendorId', language)}
              value={settings.appleVendorId}
              onChange={handleChange('appleVendorId')}
              placeholder="12345678"
            />
            <div className="md:col-span-2">
              <Input
                label={t('contactEmail', language)}
                type="email"
                value={settings.contactEmail}
                onChange={handleChange('contactEmail')}
                placeholder="email@example.com"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-col items-end gap-2">
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">{t('settingsSaved', language)}</span>
            )}
            <div className="w-full flex items-center justify-between gap-4">
              <span className="text-sm section-subtle text-left">
                Details are saved locally in your browser local storage. We never store anything or share with anyone the data that you enter on this page.
              </span>
              <Button onClick={handleSave}>{t('saveSettings', language)}</Button>
            </div>
          </div>
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
