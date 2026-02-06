import type { Language } from '../lib/i18n';

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-0 app-tablist">
      <button
        type="button"
        onClick={() => onChange('de')}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
          language === 'de'
            ? 'app-tab-active'
            : 'app-tab-idle'
        }`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
          language === 'en'
            ? 'app-tab-active'
            : 'app-tab-idle'
        }`}
      >
        EN
      </button>
    </div>
  );
}
