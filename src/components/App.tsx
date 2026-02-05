import { useState, useEffect, useCallback } from 'react';
import { LanguageToggle } from './LanguageToggle';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title', language)}</h1>
            <p className="text-gray-600 mt-1">{t('subtitle', language)}</p>
          </div>
          <LanguageToggle language={language} onChange={handleLanguageChange} />
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
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {reportData && (
            <ReportPreview data={reportData} settings={settings} language={language} />
          )}
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>{t('privacyNote', language)}</p>
        </footer>
      </div>
    </div>
  );
}
