import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import type { AppleReportData } from './parsers/apple';
import { formatAmountGerman } from './parsers/apple';
import type { BusinessSettings } from './storage';
import type { Language } from './i18n';
import { t } from './i18n';

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

  return `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size: 10px; line-height: 1.2; max-width: 800px; margin: 0 auto; padding: 30px; background: white;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
    <div></div>
    <div style="text-align: right; font-size: 9px;">
      <strong>Apple Distribution International Ltd.</strong><br>
      Hollyhill Industrial Estate<br>
      Hollyhill, Cork<br>
      Republic of Ireland<br>
      VAT ID: IE9700053D
    </div>
  </div>

  <div style="margin-bottom: 20px;">
    ${recipient}
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div style="width: 50%;"></div>
    <div style="width: 50%; font-size: 9px;">
      ${settings.appleVendorId ? `<div style="display: flex; justify-content: space-between; margin-bottom: 2px;"><span>${t('pdfVendorId', lang)}:</span> <span>${settings.appleVendorId}</span></div>` : ''}
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>${t('pdfReportId', lang)}:</span> <span>${data.reportId}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>${t('pdfDate', lang)}:</span> <span>${data.endDate}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span>${t('pdfPeriod', lang)}:</span> <span>${data.startDate} - ${data.endDate}</span>
      </div>
    </div>
  </div>

  <h2 style="margin: 20px 0 8px 0; font-size: 12px; font-weight: bold;">${t('pdfTitle', lang)} ${data.reportId}</h2>
  <p style="margin-bottom: 10px; font-size: 9px; color: #666;">${t('pdfSubtitle', lang)}</p>
  <p style="margin-bottom: 15px; font-size: 9px; color: #333;"><strong>${t('pdfBookingHint', lang)}:</strong> ${bookingHint}</p>

  <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
    <thead>
      <tr style="background: #f8f8f8;">
        <th style="border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 9px; width: 8%;">${t('pdfPos', lang)}</th>
        <th style="border: 1px solid #ccc; padding: 4px 6px; text-align: left; font-size: 9px; width: 50%;">${t('pdfDescription', lang)}</th>
        <th style="border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px; width: 10%;">${t('pdfQuantity', lang)}</th>
        <th style="border: 1px solid #ccc; padding: 4px 6px; text-align: center; font-size: 9px; width: 12%;">${t('pdfUnit', lang)}</th>
        <th style="border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px; width: 10%;">${t('pdfUnitPrice', lang)}</th>
        <th style="border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px; width: 10%;">${t('pdfTotal', lang)}</th>
      </tr>
    </thead>
    <tbody>
      ${tableRows.map(row => `
      <tr>
        <td style="border: 1px solid #ccc; padding: 4px 6px; font-size: 9px;">${row.pos}</td>
        <td style="border: 1px solid #ccc; padding: 4px 6px; font-size: 9px;">${row.description}</td>
        <td style="border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px;">${row.quantity}</td>
        <td style="border: 1px solid #ccc; padding: 4px 6px; text-align: center; font-size: 9px;">${row.unit}</td>
        <td style="border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px;">${row.price}</td>
        <td style="border: 1px solid #ccc; padding: 4px 6px; text-align: right; font-size: 9px;">${row.total}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end; margin: 15px 0;">
    <div style="width: 180px; border-top: 1px solid #ccc; padding-top: 8px;">
      <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 9px;">
        <span>${t('pdfSubtotal', lang)}</span>
        <span>${formatAmountGerman(calculatedTotal)} EUR</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin: 3px 0; font-size: 9px; font-weight: bold; border-top: 1px solid #ccc; padding-top: 4px; margin-top: 4px;">
        <strong>${t('pdfGrandTotal', lang)}</strong>
        <strong>${formatAmountGerman(totalAmount)} EUR</strong>
      </div>
    </div>
  </div>

  <div style="margin-top: 20px; font-size: 9px;">
    <strong>Steuerhinweis:</strong> ${t('pdfTaxNote', lang)}
  </div>

  <div style="margin-top: 25px; border-top: 1px solid #ccc; padding-top: 15px; font-size: 8px; color: #666;">
    <div style="display: flex; justify-content: space-between; align-items: end;">
      <div>
        <strong>${t('pdfDocType', lang)}:</strong> ${t('pdfDocTypeValue', lang)}<br>
        <strong>${t('pdfSource', lang)}:</strong> ${t('pdfSourceValue', lang)}<br>
        <strong>Apple VAT ID:</strong> IE9700053D
      </div>
      <div style="font-size: 7px; color: #999; text-align: right;">
        ${bookingHint.split('(')[1]?.replace(')', '') || ''}<br>
      </div>
    </div>
    <div style="text-align: center; margin-top: 15px; font-size: 7px; color: #999;">
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
