import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/Tabs';
import type { ReactNode } from 'react';
import type { Language } from '../lib/i18n';
import { t } from '../lib/i18n';

interface ReportTabsProps {
  language: Language;
  children: ReactNode;
}

export function ReportTabs({ language, children }: ReportTabsProps) {
  return (
    <Tabs defaultValue="apple" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="apple">{t('tabApple', language)}</TabsTrigger>
        {/* future tabs: <TabsTrigger value="amazon">Amazon Settlement</TabsTrigger> */}
      </TabsList>
      <TabsContent value="apple">{children}</TabsContent>
    </Tabs>
  );
}
