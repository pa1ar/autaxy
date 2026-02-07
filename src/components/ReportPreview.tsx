import { useRef, useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import type { AppleReportData } from '../lib/parsers/apple';
import type { BusinessSettings } from '../lib/storage';
import type { Language } from '../lib/i18n';
import { t } from '../lib/i18n';
import { generatePreviewHtml, generatePdf, PDF_BASE_CSS, PDF_PRINT_CSS, TABLE_CSS } from '../lib/pdf-generator';
import { trackPdfGenerated } from '../lib/analytics';

interface ReportPreviewProps {
  data: AppleReportData;
  settings: BusinessSettings;
  language: Language;
}

export function ReportPreview({ data, settings, language }: ReportPreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeHeight, setIframeHeight] = useState(600);

  const html = generatePreviewHtml(data, settings, language);

  // write HTML to iframe and adjust height
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Autaxy - tax automation by 1ar labs</title><style>${PDF_BASE_CSS}${TABLE_CSS}${PDF_PRINT_CSS}</style></head><body>${html}</body></html>`);
    doc.close();

    // adjust iframe height to content
    const adjustHeight = () => {
      const body = doc.body;
      if (body) {
        const height = body.scrollHeight + 40;
        setIframeHeight(height);
      }
    };

    // wait for content to render
    setTimeout(adjustHeight, 100);
  }, [html]);

  const handlePrintPdf = async () => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const doc = iframe.contentDocument;
    if (!doc) return;

    try {
      const previewElement = doc.querySelector('.pdf-preview') as HTMLElement;
      if (!previewElement) return;

      await generatePdf(previewElement);
      trackPdfGenerated('apple', data.summary.totalPartnerShare);
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert(t('errorPdf', language));
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('preview', language)}</CardTitle>
        <Button onClick={handlePrintPdf}>
          {t('printPdf', language)}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl">
          <iframe
            ref={iframeRef}
            title="PDF Preview"
            style={{ width: '100%', height: iframeHeight, border: 'none', borderRadius: '16px' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
