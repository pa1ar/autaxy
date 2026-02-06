import type { AppleReportData } from './parsers/apple';
import { formatAmountGerman } from './parsers/apple';
import type { BusinessSettings } from './storage';
import type { Language } from './i18n';
import { t } from './i18n';

export const PDF_BASE_CSS = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body { margin: 0; padding: 0; }
`;

// css for table borders - must be in a <style> tag (not inline) for html2canvas
export const TABLE_CSS = `
.invoice-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
.invoice-table th, .invoice-table td { border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 9px; }
.invoice-table th { background: #f8f8f8; font-weight: bold; }
.invoice-table .al-r { text-align: right; }
.invoice-table .al-c { text-align: center; }
`;

export const PDF_PRINT_CSS = `
@page { size: A4; margin: 12mm; }
@media print {
  body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .pdf-preview {
    max-width: none !important;
    margin: 0 !important;
    box-shadow: none !important;
  }
}
`;

// inline styles for non-table elements (these work fine with html2canvas)
const S = {
  preview: 'background: white; max-width: 800px; margin: 20px auto; padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; font-size: 10px; line-height: 1.2;',
  header: 'display: flex; justify-content: space-between; margin-bottom: 25px;',
  sender: 'text-align: right; font-size: 9px;',
  recipient: 'margin-bottom: 20px;',
  details: 'display: flex; justify-content: space-between; margin-bottom: 20px;',
  detailsRight: 'width: 50%; font-size: 9px;',
  detailsRow: 'display: flex; justify-content: space-between; margin-bottom: 2px;',
  summarySection: 'display: flex; justify-content: flex-end; margin: 15px 0;',
  summaryBox: 'width: 180px; border-top: 1px solid #ccc; padding-top: 8px;',
  summaryRow: 'display: flex; justify-content: space-between; margin: 3px 0; font-size: 9px;',
  summaryTotal: 'display: flex; justify-content: space-between; margin: 3px 0; font-size: 9px; font-weight: bold; border-top: 1px solid #ccc; padding-top: 4px; margin-top: 4px;',
  taxNote: 'margin-top: 20px; font-size: 9px;',
  footer: 'margin-top: 25px; border-top: 1px solid #ccc; padding-top: 15px; font-size: 8px; color: #666;',
  footerContent: 'display: flex; justify-content: space-between; align-items: flex-end;',
  footerRight: 'font-size: 7px; color: #999; text-align: right;',
  footerCenter: 'text-align: center; margin-top: 15px; font-size: 7px; color: #999;',
  title: 'margin: 20px 0 8px 0; font-size: 12px; font-weight: bold;',
  subtitle: 'margin-bottom: 10px; font-size: 9px; color: #666;',
  bookingHint: 'margin-bottom: 15px; font-size: 9px; color: #333;',
};

export function generatePreviewHtml(
  data: AppleReportData,
  settings: BusinessSettings,
  lang: Language
): string {
  const totalAmount = data.summary.totalPartnerShare;
  const isPositive = totalAmount >= 0;
  const bookingHint = isPositive ? t('pdfRevenueHint', lang) : t('pdfRefundHint', lang);

  let pos = 1;
  const tableRows = data.transactions.map((tx) => {
    let description = `${tx.title} - ${tx.country}`;
    if (tx.sku) description += ` (${tx.sku})`;
    if (tx.originalCurrency && tx.originalCurrency !== 'EUR') {
      description += ` [${formatAmountGerman(tx.customerPrice)} ${tx.originalCurrency}]`;
    }

    let individualPrice: number;
    let quantityDisplay: string | number = tx.quantity;
    let unitLabel = t('pdfUnitPiece', lang);

    if (tx.quantity > 0) {
      individualPrice = Math.round((tx.partnerShare / tx.quantity) * 100) / 100;
    } else {
      individualPrice = tx.partnerShare;
      quantityDisplay = '-';
      unitLabel = t('pdfUnitCorrection', lang);
      description += ` ${t('pdfRefundNote', lang)}`;
    }

    return {
      pos: pos++,
      description,
      quantity: quantityDisplay,
      unit: unitLabel,
      price: formatAmountGerman(individualPrice),
      total: formatAmountGerman(tx.partnerShare)
    };
  });

  const calculatedTotal = data.transactions.reduce((sum, tx) => sum + tx.partnerShare, 0);
  const recipient = [
    settings.companyName,
    settings.street,
    settings.zipCity,
    settings.country,
    settings.vatId ? `USt-IdNr.: ${settings.vatId}` : ''
  ].filter(Boolean).join('<br>');

  const today = new Date().toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-GB');
  const bookingShort = bookingHint.split('(')[1]?.replace(')', '') || '';

  return `
<div class="pdf-preview" style="${S.preview}">
  <div style="${S.header}">
    <div></div>
    <div style="${S.sender}">
      <strong>Apple Distribution International Ltd.</strong><br>
      Hollyhill Industrial Estate<br>
      Hollyhill, Cork<br>
      Republic of Ireland<br>
      VAT ID: IE9700053D
    </div>
  </div>

  <div style="${S.recipient}">
    ${recipient}
  </div>

  <div style="${S.details}">
    <div style="width: 50%;"></div>
    <div style="${S.detailsRight}">
      ${settings.appleVendorId ? `<div style="${S.detailsRow}"><span>${t('pdfVendorId', lang)}:</span> <span>${settings.appleVendorId}</span></div>` : ''}
      <div style="${S.detailsRow}">
        <span>${t('pdfReportId', lang)}:</span> <span>${data.reportId}</span>
      </div>
      <div style="${S.detailsRow}">
        <span>${t('pdfDate', lang)}:</span> <span>${data.endDate}</span>
      </div>
      <div style="${S.detailsRow}">
        <span>${t('pdfPeriod', lang)}:</span> <span>${data.startDate} - ${data.endDate}</span>
      </div>
    </div>
  </div>

  <h2 style="${S.title}">${t('pdfTitle', lang)} ${data.reportId}</h2>
  <p style="${S.subtitle}">${t('pdfSubtitle', lang)} (${lang === 'de' ? 'Quelle' : 'Source'}: Apple Financial Report)</p>
  <p style="${S.bookingHint}"><strong>${t('pdfBookingHint', lang)}:</strong> ${bookingHint}</p>

  <table class="invoice-table">
    <thead>
      <tr>
        <th style="width: 8%;">${t('pdfPos', lang)}</th>
        <th style="width: 50%;">${t('pdfDescription', lang)}</th>
        <th class="al-r" style="width: 10%;">${t('pdfQuantity', lang)}</th>
        <th class="al-c" style="width: 12%;">${t('pdfUnit', lang)}</th>
        <th class="al-r" style="width: 10%;">${t('pdfUnitPrice', lang)}</th>
        <th class="al-r" style="width: 10%;">${t('pdfTotal', lang)}</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows.map(row => `
      <tr>
        <td>${row.pos}</td>
        <td>${row.description}</td>
        <td class="al-r">${row.quantity}</td>
        <td class="al-c">${row.unit}</td>
        <td class="al-r">${row.price}</td>
        <td class="al-r">${row.total}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="${S.summarySection}">
    <div style="${S.summaryBox}">
      <div style="${S.summaryRow}">
        <span>${t('pdfSubtotal', lang)}</span>
        <span>${formatAmountGerman(calculatedTotal)} EUR</span>
      </div>
      <div style="${S.summaryTotal}">
        <strong>${t('pdfGrandTotal', lang)}</strong>
        <strong>${formatAmountGerman(totalAmount)} EUR</strong>
      </div>
    </div>
  </div>

  <div style="${S.taxNote}">
    <strong>Steuerhinweis:</strong> ${t('pdfTaxNote', lang)}
  </div>

  <div style="${S.footer}">
    <div style="${S.footerContent}">
      <div>
        <strong>${t('pdfDocType', lang)}:</strong> ${t('pdfDocTypeValue', lang)}<br>
        <strong>${t('pdfSource', lang)}:</strong> ${t('pdfSourceValue', lang)}<br>
        <strong>Apple VAT ID:</strong> IE9700053D
      </div>
      <div style="${S.footerRight}">
        ${lang === 'de' ? 'Für Buchhaltung' : 'For accounting'}: ${bookingShort}<br>
      </div>
    </div>
    <div style="${S.footerCenter}">
      ${t('pdfCreated', lang)}: ${today} | ${t('pdfPage', lang)} 1/1
    </div>
  </div>
</div>
  `;
}

export async function generatePdf(
  element: HTMLElement
): Promise<void> {
  const view = element.ownerDocument.defaultView;
  if (!view) {
    throw new Error('Print view is not available');
  }

  view.focus();
  view.print();
}
