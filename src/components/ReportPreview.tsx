import { useRef, useEffect, useState } from 'react';
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
    doc.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0;padding:0;">${html}</body></html>`);
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

  const handleGeneratePdf = async () => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument?.body) return;

    const previewElement = iframe.contentDocument.body.querySelector('.pdf-preview') as HTMLElement;
    if (!previewElement) return;

    try {
      await generatePdf(previewElement, data);
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
        <Button onClick={handleGeneratePdf}>
          {t('generatePdf', language)}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
          <iframe
            ref={iframeRef}
            title="PDF Preview"
            style={{ width: '100%', height: iframeHeight, border: 'none' }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
