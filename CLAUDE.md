# Autaxy

Apple Financial Report to PDF converter for German tax compliance.

## Stack
- Astro 5 + React islands
- Tailwind 4
- Bun
- Vercel (deployment + analytics)

## Dev
bun install
bun run dev

## Deploy
vercel deploy --prod

## Key Files
- src/lib/parsers/apple.ts - Apple report parsing
- src/lib/pdf-generator.ts - PDF creation
- src/components/BusinessSettings.tsx - user settings form
- src/components/ReportUploader.tsx - file upload + paste

## Localization
DE/EN. Strings in src/lib/i18n.ts. Default from browser, stored in localStorage.

## Analytics
Vercel Analytics. Events: page_view, report_parsed, pdf_generated, settings_saved

## Business Settings Storage
localStorage key: autaxy_business_settings

## UI Remark
- Keep scrollbar space reserved to avoid page jump when vertical scrollbar appears: `html { scrollbar-gutter: stable; }`
