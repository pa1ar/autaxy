import { useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import type { AppleReportData } from '../lib/parsers/apple';
import type { BusinessSettings } from '../lib/storage';
import type { Language } from '../lib/i18n';
import { t } from '../lib/i18n';
import { generatePreviewHtml, generatePdf } from '../lib/pdf-generator';
import { trackPdfGenerated } from '../lib/analytics';

interface ReportPreviewProps {
  data: AppleReportData;
  settings: BusinessSettings;
  language: Language;
}

export function ReportPreview({ data, settings, language }: ReportPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);

  const handleGeneratePdf = async () => {
    if (!previewRef.current) return;
    try {
      await generatePdf(previewRef.current, data);
      trackPdfGenerated('apple', data.summary.totalPartnerShare);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(t('errorPdf', language));
    }
  };

  const html = generatePreviewHtml(data, settings, language);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('preview', language)}</CardTitle>
        <Button onClick={handleGeneratePdf}>
          {t('generatePdf', language)}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-inner">
          <div
            ref={previewRef}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
