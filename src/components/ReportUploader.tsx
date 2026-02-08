import { useState, useRef, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Textarea } from './ui/Input';
import { Button } from './ui/Button';
import type { Language } from '../lib/i18n';
import { t } from '../lib/i18n';

interface ReportUploaderProps {
  language: Language;
  onTextChange: (text: string) => void;
  onProcess: () => void;
}

export function ReportUploader({ language, onTextChange, onProcess }: ReportUploaderProps) {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTextChange(e.target.value);
  };

  const handleFileRead = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setText(content);
      onTextChange(content);
      setFileName(file.name);
    };
    reader.readAsText(file);
  }, [onTextChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileRead(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileRead(file);
  }, [handleFileRead]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData('text');
    if (pastedText) {
      setText(pastedText);
      onTextChange(pastedText);
      setFileName(null);
    }
  }, [onTextChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('uploadTitle', language)}</CardTitle>
        <CardDescription>{t('uploadDescription', language)}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 mb-4 items-stretch">
          <div
            className={`relative concave-well p-8 text-center cursor-pointer transition-colors min-h-[320px] flex items-center justify-center ${
              isDragging ? 'ring-2 ring-amber-300' : fileName ? 'ring-1 ring-green-300' : ''
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileName ? (
              <div>
                <div className="text-green-600 dark:text-green-400 font-medium">{fileName}</div>
                <div className="text-sm section-subtle mt-1">Click to change file</div>
              </div>
            ) : (
              <div>
                <div className="section-subtle">{t('dropzone', language)}</div>
                <div className="text-sm section-subtle mt-1">.csv, .txt</div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center section-subtle text-sm font-medium">
            <span className="px-3 py-1 rounded-full border border-[color:color-mix(in_srgb,var(--color-base-content)_10%,transparent)] bg-[var(--color-base-100)]/70">
              {t('dropzoneOr', language)}
            </span>
          </div>

          <div className="concave-well p-4">
            <Textarea
              label={t('pasteLabel', language)}
              value={text}
              onChange={handleTextChange}
              onPaste={handlePaste}
              placeholder={t('pastePlaceholder', language)}
              rows={10}
              className="h-full min-h-[288px] yellow-scrollbar paste-textarea"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <p className="text-sm section-subtle">{t('privacyNote', language)}</p>
          <Button onClick={onProcess} disabled={!text.trim()}>
            {t('processReport', language)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
