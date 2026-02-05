import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { AppleReportData } from './parsers/apple';
import { formatAmountGerman } from './parsers/apple';
import type { BusinessSettings } from './storage';
import type { Language } from './i18n';
import { t } from './i18n';

// inline styles for html2canvas compatibility (it doesn't read CSS from <style> tags in iframes)
const S = {
  preview: 'background: white; max-width: 800px; margin: 20px auto; padding: 30px; box-shadow: 0 0 20px rgba(0,0,0,0.1); font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Arial, sans-serif; font-size: 10px; line-height: 1.2;',
  header: 'display: flex; justify-content: space-between; margin-bottom: 25px;',
  sender: 'text-align: right; font-size: 9px;',
  recipient: 'margin-bottom: 20px;',
  details: 'display: flex; justify-content: space-between; margin-bottom: 20px;',
  detailsRight: 'width: 50%; font-size: 9px;',
  detailsRow: 'display: flex; justify-content: space-between; margin-bottom: 2px;',
  table: 'width: 100%; border-collapse: collapse; margin: 15px 0;',
  th: 'border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 9px; background: #f8f8f8; font-weight: bold;',
  thRight: 'border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px; background: #f8f8f8; font-weight: bold;',
  thCenter: 'border: 1px solid #ccc; padding: 4px 6px; text-align: center; font-size: 9px; background: #f8f8f8; font-weight: bold;',
  td: 'border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 9px;',
  tdRight: 'border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px;',
  tdCenter: 'border: 1px solid #ccc; padding: 4px 6px; text-align: center; font-size: 9px;',
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

  <table style="${S.table}">
    <thead>
      <tr>
        <th style="${S.th} width: 8%;">${t('pdfPos', lang)}</th>
        <th style="${S.th} width: 50%;">${t('pdfDescription', lang)}</th>
        <th style="${S.thRight} width: 10%;">${t('pdfQuantity', lang)}</th>
        <th style="${S.thCenter} width: 12%;">${t('pdfUnit', lang)}</th>
        <th style="${S.thRight} width: 10%;">${t('pdfUnitPrice', lang)}</th>
        <th style="${S.thRight} width: 10%;">${t('pdfTotal', lang)}</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows.map(row => `
      <tr>
        <td style="${S.td}">${row.pos}</td>
        <td style="${S.td}">${row.description}</td>
        <td style="${S.tdRight}">${row.quantity}</td>
        <td style="${S.tdCenter}">${row.unit}</td>
        <td style="${S.tdRight}">${row.price}</td>
        <td style="${S.tdRight}">${row.total}</td>
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
  element: HTMLElement,
  data: AppleReportData
): Promise<void> {
  const canvas = await html2canvas(element, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    removeContainer: true,
    imageTimeout: 0,
    logging: false
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.85);
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  const filename = `Apple_Financial_Report_${data.reportId}_${data.endDate.replace(/\./g, '-')}.pdf`;
  pdf.save(filename);
}
