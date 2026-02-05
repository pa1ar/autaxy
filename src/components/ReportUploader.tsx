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
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-4 ${
            isDragging ? 'border-blue-500 bg-blue-50' : fileName ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
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
              <div className="text-green-600 font-medium">{fileName}</div>
              <div className="text-sm text-gray-500 mt-1">Click to change file</div>
            </div>
          ) : (
            <div>
              <div className="text-gray-600">{t('dropzone', language)}</div>
              <div className="text-sm text-gray-400 mt-1">.csv, .txt</div>
            </div>
          )}
        </div>

        <div className="text-center text-gray-400 text-sm mb-4">{t('dropzoneOr', language)}</div>

        <Textarea
          label={t('pasteLabel', language)}
          value={text}
          onChange={handleTextChange}
          onPaste={handlePaste}
          placeholder={t('pastePlaceholder', language)}
          rows={10}
        />

        <div className="mt-4">
          <Button onClick={onProcess} disabled={!text.trim()}>
            {t('processReport', language)}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
