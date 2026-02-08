import { useState, useEffect, useCallback } from 'react';
import { LanguageToggle } from './LanguageToggle';
import { ThemeToggle } from './ThemeToggle';
import { BusinessSettings } from './BusinessSettings';
import { ReportUploader } from './ReportUploader';
import { ReportPreview } from './ReportPreview';
import { ReportTabs } from './ReportTabs';
import { getDefaultLanguage, setLanguage, type Language, t } from '../lib/i18n';
import { loadSettings, hasSettings, type BusinessSettings as Settings } from '../lib/storage';
import { parseAppleReport, type AppleReportData } from '../lib/parsers/apple';
import { trackPageView, trackReportParsed } from '../lib/analytics';

export function App() {
  const [language, setLang] = useState<Language>('de');
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [reportText, setReportText] = useState('');
  const [reportData, setReportData] = useState<AppleReportData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lang = getDefaultLanguage();
    setLang(lang);
    trackPageView(lang, hasSettings());
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLang(lang);
    setLanguage(lang);
  };

  const handleSettingsChange = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
  }, []);

  const handleProcess = () => {
    setError(null);
    if (!reportText.trim()) {
      setError(t('errorNoData', language));
      return;
    }

    try {
      const data = parseAppleReport(reportText);
      setReportData(data);
      trackReportParsed('apple', data.transactions.length);
    } catch (err) {
      setError(`${t('errorParsing', language)}: ${err instanceof Error ? err.message : String(err)}`);
      setReportData(null);
    }
  };

  return (
    <div className="app-shell">
      <div className="app-container">
        <header className="app-topbar">
          <div>
            <h1 className="brand-title">{t('title', language)}</h1>
            <p className="section-subtle mt-2">{t('subtitle', language)}</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle language={language} onChange={handleLanguageChange} />
          </div>
        </header>

        <div className="space-y-6">
          <BusinessSettings language={language} onSettingsChange={handleSettingsChange} />

          <ReportTabs language={language}>
            <ReportUploader
              language={language}
              onTextChange={setReportText}
              onProcess={handleProcess}
            />
          </ReportTabs>

          {error && (
            <div className="px-4 py-3 rounded-2xl border" style={{ background: 'color-mix(in srgb, var(--color-error) 10%, var(--color-base-100))', borderColor: 'color-mix(in srgb, var(--color-error) 28%, transparent)', color: 'color-mix(in srgb, var(--color-error) 85%, var(--color-base-content))' }}>
              {error}
            </div>
          )}

          {reportData && (
            <ReportPreview data={reportData} settings={settings} language={language} />
          )}
        </div>

      </div>
    </div>
  );
}
