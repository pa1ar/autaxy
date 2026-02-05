import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { AppleReportData } from './parsers/apple';
import { formatAmountGerman } from './parsers/apple';
import type { BusinessSettings } from './storage';
import type { Language } from './i18n';
import { t } from './i18n';

// styles matching the original HTML exactly
const pdfStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  .pdf-preview {
    background: white;
    max-width: 800px;
    margin: 20px auto;
    padding: 30px;
    box-shadow: 0 0 20px rgba(0,0,0,0.1);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
    font-size: 10px;
    line-height: 1.2;
  }
  .pdf-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
  }
  .sender-info {
    text-align: right;
    font-size: 9px;
  }
  .recipient-info {
    margin-bottom: 20px;
  }
  .invoice-details {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }
  .invoice-details-right {
    width: 50%;
    font-size: 9px;
  }
  .invoice-details-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 2px;
  }
  .invoice-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  .invoice-table th,
  .invoice-table td {
    border: 1px solid #ccc;
    padding: 4px 6px;
    text-align: left;
    font-size: 9px;
  }
  .invoice-table th {
    background: #f8f8f8;
    font-weight: bold;
  }
  .invoice-table td:last-child,
  .invoice-table th:last-child {
    text-align: right;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }
  .summary-section {
    display: flex;
    justify-content: flex-end;
    margin: 15px 0;
  }
  .summary-box {
    width: 180px;
    border-top: 1px solid #ccc;
    padding-top: 8px;
  }
  .summary-row {
    display: flex;
    justify-content: space-between;
    margin: 3px 0;
    font-size: 9px;
  }
  .summary-total {
    font-weight: bold;
    border-top: 1px solid #ccc;
    padding-top: 4px;
    margin-top: 4px;
  }
  .tax-note {
    margin-top: 20px;
    font-size: 9px;
  }
  .footer-section {
    margin-top: 25px;
    border-top: 1px solid #ccc;
    padding-top: 15px;
    font-size: 8px;
    color: #666;
  }
  .footer-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .footer-right {
    font-size: 7px;
    color: #999;
    text-align: right;
  }
  .footer-center {
    text-align: center;
    margin-top: 15px;
    font-size: 7px;
    color: #999;
  }
  .title {
    margin: 20px 0 8px 0;
    font-size: 12px;
    font-weight: bold;
  }
  .subtitle {
    margin-bottom: 10px;
    font-size: 9px;
    color: #666;
  }
  .booking-hint {
    margin-bottom: 15px;
    font-size: 9px;
    color: #333;
  }
`;

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
<style>${pdfStyles}</style>
<div class="pdf-preview">
  <div class="pdf-header">
    <div></div>
    <div class="sender-info">
      <strong>Apple Distribution International Ltd.</strong><br>
      Hollyhill Industrial Estate<br>
      Hollyhill, Cork<br>
      Republic of Ireland<br>
      VAT ID: IE9700053D
    </div>
  </div>

  <div class="recipient-info">
    ${recipient}
  </div>

  <div class="invoice-details">
    <div style="width: 50%;"></div>
    <div class="invoice-details-right">
      ${settings.appleVendorId ? `<div class="invoice-details-row"><span>${t('pdfVendorId', lang)}:</span> <span>${settings.appleVendorId}</span></div>` : ''}
      <div class="invoice-details-row">
        <span>${t('pdfReportId', lang)}:</span> <span>${data.reportId}</span>
      </div>
      <div class="invoice-details-row">
        <span>${t('pdfDate', lang)}:</span> <span>${data.endDate}</span>
      </div>
      <div class="invoice-details-row">
        <span>${t('pdfPeriod', lang)}:</span> <span>${data.startDate} - ${data.endDate}</span>
      </div>
    </div>
  </div>

  <h2 class="title">${t('pdfTitle', lang)} ${data.reportId}</h2>
  <p class="subtitle">${t('pdfSubtitle', lang)} (${lang === 'de' ? 'Quelle' : 'Source'}: Apple Financial Report)</p>
  <p class="booking-hint"><strong>${t('pdfBookingHint', lang)}:</strong> ${bookingHint}</p>

  <table class="invoice-table">
    <thead>
      <tr>
        <th style="width: 8%;">${t('pdfPos', lang)}</th>
        <th style="width: 50%;">${t('pdfDescription', lang)}</th>
        <th style="width: 10%;" class="text-right">${t('pdfQuantity', lang)}</th>
        <th style="width: 12%;" class="text-center">${t('pdfUnit', lang)}</th>
        <th style="width: 10%;" class="text-right">${t('pdfUnitPrice', lang)}</th>
        <th style="width: 10%;">${t('pdfTotal', lang)}</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows.map(row => `
      <tr>
        <td>${row.pos}</td>
        <td>${row.description}</td>
        <td class="text-right">${row.quantity}</td>
        <td class="text-center">${row.unit}</td>
        <td class="text-right">${row.price}</td>
        <td>${row.total}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="summary-section">
    <div class="summary-box">
      <div class="summary-row">
        <span>${t('pdfSubtotal', lang)}</span>
        <span>${formatAmountGerman(calculatedTotal)} EUR</span>
      </div>
      <div class="summary-row summary-total">
        <strong>${t('pdfGrandTotal', lang)}</strong>
        <strong>${formatAmountGerman(totalAmount)} EUR</strong>
      </div>
    </div>
  </div>

  <div class="tax-note">
    <strong>Steuerhinweis:</strong> ${t('pdfTaxNote', lang)}
  </div>

  <div class="footer-section">
    <div class="footer-content">
      <div>
        <strong>${t('pdfDocType', lang)}:</strong> ${t('pdfDocTypeValue', lang)}<br>
        <strong>${t('pdfSource', lang)}:</strong> ${t('pdfSourceValue', lang)}<br>
        <strong>Apple VAT ID:</strong> IE9700053D
      </div>
      <div class="footer-right">
        ${lang === 'de' ? 'Für Buchhaltung' : 'For accounting'}: ${bookingShort}<br>
      </div>
    </div>
    <div class="footer-center">
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
