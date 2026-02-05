import { track } from '@vercel/analytics';

export function trackPageView(lang: string, hasSettings: boolean): void {
  track('page_view', { lang, has_settings: hasSettings ? 'true' : 'false' });
}

export function trackReportParsed(type: string, rows: number): void {
  track('report_parsed', { type, rows: String(rows) });
}

export function trackPdfGenerated(type: string, totalEur: number): void {
  track('pdf_generated', { type, total_eur: String(Math.round(totalEur * 100) / 100) });
}

export function trackSettingsSaved(hasVatId: boolean): void {
  track('settings_saved', { has_vat_id: hasVatId ? 'true' : 'false' });
}
