export interface AppleTransaction {
  transactionDate: string;
  settlementDate: string;
  sku: string;
  title: string;
  country: string;
  quantity: number;
  partnerShare: number;
  currency: string;
  customerPrice: number;
  originalCurrency?: string;
}

export interface AppleReportData {
  vendorName: string;
  startDate: string;
  endDate: string;
  reportId: string;
  transactions: AppleTransaction[];
  summary: {
    totalPartnerShare: number;
    byCountry: Record<string, number>;
  };
}

function getMonthNumber(monthName: string): string {
  const months: Record<string, string> = {
    January: '01', February: '02', March: '03', April: '04',
    May: '05', June: '06', July: '07', August: '08',
    September: '09', October: '10', November: '11', December: '12'
  };
  return months[monthName] || '01';
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

function formatAppleDate(dateStr: string): string {
  if (!dateStr) return '';
  // convert MM/DD/YYYY to DD.MM.YYYY
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    return `${parts[1].padStart(2, '0')}.${parts[0].padStart(2, '0')}.${parts[2]}`;
  }
  return dateStr;
}

function parseCSVReport(text: string): AppleReportData {
  const lines = text.trim().split('\n');

  const data: AppleReportData = {
    vendorName: '',
    startDate: '',
    endDate: '',
    reportId: '',
    transactions: [],
    summary: {
      totalPartnerShare: 0,
      byCountry: {}
    }
  };

  // extract date from header like "iTunes Connect - Payments and Financial Reports (June, 2025)"
  const headerMatch = lines[0].match(/\((\w+),\s*(\d{4})\)/);
  if (headerMatch) {
    const [, month, year] = headerMatch;
    const monthNum = getMonthNumber(month);
    data.reportId = `APPLE-${year}-${monthNum}`;
    data.startDate = `01.${monthNum}.${year}`;
    const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
    data.endDate = `${lastDay}.${monthNum}.${year}`;
  }

  // CSV columns: 0=Country, 1=Units, 2=Earned, 3=InputTax, 4=Adjustments,
  //              5=WithholdingTax, 6=TotalOwed, 7=Proceeds, 8=BankAccountCurrency, 9=(empty/trailing)
  // report may contain multiple currency blocks separated by summary lines + headers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith(',,,')) continue;

    // skip header rows and summary/label lines
    if (line.includes('iTunes Connect') || line.includes('Country or Region')) continue;
    if (line.includes('Estimated Proceeds')) continue;

    const values = parseCSVLine(line);
    if (values.length < 8) continue;

    const countryRegion = values[0];
    if (!countryRegion) continue;

    const units = parseInt(values[1]) || 0;
    if (units === 0 && !values[1]) continue;

    const earned = parseFloat(values[2]) || 0;
    const proceeds = parseFloat(values[7]) || 0;
    const bankCurrency = values[8] || 'EUR';

    // extract country and original currency from format "Country (USD)"
    const countryMatch = countryRegion.match(/^(.*?)\s*\(([A-Z]{3})\)$/);
    const country = countryMatch ? countryMatch[1] : countryRegion;
    const originalCurrency = countryMatch ? countryMatch[2] : 'EUR';

    const transaction: AppleTransaction = {
      transactionDate: data.endDate,
      settlementDate: data.endDate,
      sku: 'App Store',
      title: 'App Store Sales',
      country,
      quantity: units,
      partnerShare: proceeds,
      currency: bankCurrency,
      customerPrice: earned,
      originalCurrency
    };

    data.transactions.push(transaction);
    if (bankCurrency === 'EUR') {
      data.summary.totalPartnerShare += proceeds;
    }
  }

  // sum EUR proceeds from summary lines as fallback/override
  let eurTotal = 0;
  for (const line of lines) {
    const totalMatch = line.match(/"?([\d.]+)\s*EUR"?/);
    if (totalMatch && !line.includes('Country or Region')) {
      eurTotal = Math.max(eurTotal, parseFloat(totalMatch[1]));
    }
  }
  if (eurTotal > 0) {
    data.summary.totalPartnerShare = eurTotal;
  }

  return data;
}

function parseFDReport(text: string): AppleReportData {
  const lines = text.trim().split('\n');

  const data: AppleReportData = {
    vendorName: '',
    startDate: '',
    endDate: '',
    reportId: '',
    transactions: [],
    summary: {
      totalPartnerShare: 0,
      byCountry: {}
    }
  };

  // parse header info
  for (const line of lines) {
    if (line.startsWith('Vendor Name')) {
      data.vendorName = line.split('\t')[1] || '';
    } else if (line.startsWith('Start Date')) {
      data.startDate = formatAppleDate(line.split('\t')[1] || '');
    } else if (line.startsWith('End Date')) {
      data.endDate = formatAppleDate(line.split('\t')[1] || '');
    }
  }

  // find transaction header
  let headerIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('Transaction Date') && lines[i].includes('Partner Share')) {
      headerIndex = i;
      break;
    }
  }

  if (headerIndex === -1) {
    throw new Error('No transaction data found');
  }

  // parse transactions
  let inTransactions = true;
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith('Country Of Sale')) {
      inTransactions = false;
      continue;
    }

    const values = line.split('\t');
    if (inTransactions && values.length >= 10) {
      const transaction: AppleTransaction = {
        transactionDate: formatAppleDate(values[0]),
        settlementDate: formatAppleDate(values[1]),
        sku: values[3] || '',
        title: values[4] || '',
        country: values[8] || '',
        quantity: parseInt(values[9]) || 0,
        partnerShare: parseFloat(values[10]) || 0,
        currency: values[12] || values[11] || 'EUR',
        customerPrice: parseFloat(values[13]) || 0
      };

      data.transactions.push(transaction);
      data.summary.totalPartnerShare += transaction.partnerShare;
    }
  }

  // generate report ID from date
  data.reportId = `APPLE${data.endDate.replace(/\./g, '')}`;

  return data;
}

export function parseAppleReport(text: string): AppleReportData {
  const lines = text.trim().split('\n');
  if (lines.length < 4) {
    throw new Error('Invalid report format');
  }

  // detect format
  if (lines[0].includes('iTunes Connect - Payments and Financial Reports')) {
    return parseCSVReport(text);
  }

  return parseFDReport(text);
}

export function formatAmountGerman(amount: number): string {
  return amount.toFixed(2).replace('.', ',');
}
