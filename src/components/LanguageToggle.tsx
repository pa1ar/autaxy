import type { Language } from '../lib/i18n';

interface LanguageToggleProps {
  language: Language;
  onChange: (lang: Language) => void;
}

export function LanguageToggle({ language, onChange }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange('de')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'de'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        DE
      </button>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
          language === 'en'
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        EN
      </button>
    </div>
  );
}
