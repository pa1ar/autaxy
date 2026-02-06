export type Language = 'de' | 'en';

export const translations = {
  de: {
    // Page
    title: 'autaxy',
    subtitle: 'Steuerliche Report-Workflows in einem Tool',

    // Settings
    settingsTitle: 'Business Details',
    settingsDescription: 'Diese Daten werden lokal gespeichert und in der PDF verwendet.',
    companyName: 'Firmenname',
    street: 'Straße + Hausnummer',
    zipCity: 'PLZ + Ort',
    country: 'Land',
    vatId: 'USt-IdNr. (optional)',
    appleVendorId: 'Apple Vendor ID (optional)',
    contactEmail: 'E-Mail (optional)',
    saveSettings: 'Speichern',
    settingsSaved: 'Einstellungen gespeichert',

    // Upload
    uploadTitle: 'Report Input',
    uploadDescription: 'CSV hochladen oder Report-Text direkt einfügen.',
    dropzone: 'CSV-Datei hierher ziehen oder klicken',
    dropzoneOr: 'oder',
    pasteLabel: 'Report-Text einfügen:',
    pastePlaceholder: 'Füge hier den Apple Financial Report ein (aus FD_*.txt oder .csv)',

    // Actions
    processReport: 'Report verarbeiten',
    generatePdf: 'PDF erstellen',
    printPdf: 'Drucken / Als PDF speichern',
    generatePdfSoon: 'PDF erstellen (kommt bald)',
    preview: 'Vorschau',

    // Messages
    errorNoData: 'Bitte füge einen Apple Financial Report ein',
    errorParsing: 'Fehler beim Verarbeiten',
    errorPdf: 'Fehler beim Erstellen des PDFs',
    successParsed: 'Report erfolgreich verarbeitet',
    successPdf: 'PDF wurde erstellt',
    noDataForPdf: 'Keine Daten. Bitte zuerst Report verarbeiten.',

    // PDF Content
    pdfTitle: 'Zusammenfassung Apple Financial Report',
    pdfSubtitle: 'Aufschlüsselung der App Store Transaktionen für steuerliche Zwecke',
    pdfBookingHint: 'Buchungshinweis',
    pdfRevenueHint: 'Einnahmen (SKR03: 4400 - keine Steuer, bereits von Apple abgeführt)',
    pdfRefundHint: 'Rückerstattungen (SKR03: 6700)',
    pdfVendorId: 'App Store Vendor ID',
    pdfReportId: 'Report ID',
    pdfDate: 'Abrechnungsdatum',
    pdfPeriod: 'Abrechnungszeitraum',
    pdfPos: 'Pos.',
    pdfDescription: 'Bezeichnung',
    pdfQuantity: 'Menge',
    pdfUnit: 'Einheit',
    pdfUnitPrice: 'Einzel EUR',
    pdfTotal: 'Gesamt EUR',
    pdfSubtotal: 'Zwischensumme',
    pdfGrandTotal: 'Gesamtbetrag',
    pdfTaxNote: 'Steuerschuldnerschaft des Leistungsempfängers gemäß § 13b UStG (Reverse Charge). Die Umsatzsteuer ist vom Leistungsempfänger anzumelden und abzuführen.',
    pdfDocType: 'Dokumententyp',
    pdfDocTypeValue: 'Steuerliche Aufschlüsselung Apple Financial Report',
    pdfSource: 'Quelle',
    pdfSourceValue: 'Apple Distribution International Ltd., Cork, Ireland',
    pdfCreated: 'Erstellt',
    pdfPage: 'Seite',
    pdfUnitPiece: 'Stück',
    pdfUnitCorrection: 'Korrektur',
    pdfRefundNote: '(Rückerstattung/Korrektur)',

    // Tabs
    tabApple: 'Apple Financial Report',

    // Footer
    privacyNote: 'Alle Daten werden lokal im Browser verarbeitet.',
  },
  en: {
    // Page
    title: 'autaxy',
    subtitle: 'tax report workflows',

    // Settings
    settingsTitle: 'Business Details',
    settingsDescription: 'Fill out details that should appear on your reports.',
    companyName: 'Company Name',
    street: 'Street + Number',
    zipCity: 'ZIP + City',
    country: 'Country',
    vatId: 'VAT ID (optional)',
    appleVendorId: 'Apple Vendor ID (optional)',
    contactEmail: 'Email (optional)',
    saveSettings: 'Save',
    settingsSaved: 'Settings saved',

    // Upload
    uploadTitle: 'Report Input',
    uploadDescription: 'Load CSV or paste report text directly. The file is not sent to our servers but processed locally in your browser tab.',
    dropzone: 'Drag CSV file here or click to select file from your computer',
    dropzoneOr: 'or',
    pasteLabel: 'Paste report text:',
    pastePlaceholder: 'Paste Apple Financial Report here (from FD_*.txt or .csv)',

    // Actions
    processReport: 'Process Report',
    generatePdf: 'Generate PDF',
    printPdf: 'Print / Save as PDF',
    generatePdfSoon: 'Generate PDF (coming soon)',
    preview: 'Preview',

    // Messages
    errorNoData: 'Please paste an Apple Financial Report',
    errorParsing: 'Error processing report',
    errorPdf: 'Error creating PDF',
    successParsed: 'Report processed successfully',
    successPdf: 'PDF created',
    noDataForPdf: 'No data. Please process a report first.',

    // PDF Content
    pdfTitle: 'Apple Financial Report Summary',
    pdfSubtitle: 'App Store transaction breakdown for tax purposes',
    pdfBookingHint: 'Booking note',
    pdfRevenueHint: 'Revenue (SKR03: 4400 - no tax, already remitted by Apple)',
    pdfRefundHint: 'Refunds (SKR03: 6700)',
    pdfVendorId: 'App Store Vendor ID',
    pdfReportId: 'Report ID',
    pdfDate: 'Statement Date',
    pdfPeriod: 'Statement Period',
    pdfPos: 'No.',
    pdfDescription: 'Description',
    pdfQuantity: 'Qty',
    pdfUnit: 'Unit',
    pdfUnitPrice: 'Unit EUR',
    pdfTotal: 'Total EUR',
    pdfSubtotal: 'Subtotal',
    pdfGrandTotal: 'Grand Total',
    pdfTaxNote: 'Reverse charge according to § 13b UStG. VAT to be declared and paid by the recipient.',
    pdfDocType: 'Document type',
    pdfDocTypeValue: 'Tax breakdown Apple Financial Report',
    pdfSource: 'Source',
    pdfSourceValue: 'Apple Distribution International Ltd., Cork, Ireland',
    pdfCreated: 'Created',
    pdfPage: 'Page',
    pdfUnitPiece: 'pcs',
    pdfUnitCorrection: 'Adj.',
    pdfRefundNote: '(Refund/Adjustment)',

    // Tabs
    tabApple: 'Apple Financial Report',

    // Footer
    privacyNote: 'All data is processed locally in your browser.',
  }
} as const;

export type TranslationKey = keyof typeof translations.de;

export function getDefaultLanguage(): Language {
  if (typeof window === 'undefined') return 'de';
  const stored = localStorage.getItem('autaxy_language');
  if (stored === 'de' || stored === 'en') return stored;
  const browserLang = navigator.language.slice(0, 2);
  return browserLang === 'de' ? 'de' : 'en';
}

export function setLanguage(lang: Language): void {
  localStorage.setItem('autaxy_language', lang);
}

export function t(key: TranslationKey, lang: Language): string {
  return translations[lang][key];
}
