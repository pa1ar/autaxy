# Autaxy

Convert Apple Financial Reports into tax-compliant PDF documents for German bookkeeping.

## Features

- Parse Apple iTunes Connect CSV and FD_*.txt reports
- Generate professional PDFs with German tax requirements (Reverse Charge, 13b UStG)
- Save your business details locally (never sent to server)
- German and English interface

## Usage

1. Go to [1ar.io/tools/autaxy](https://1ar.io/tools/autaxy)
2. Enter your business details (saved in browser)
3. Upload or paste your Apple Financial Report
4. Preview and download PDF

## Privacy

All processing happens in your browser. Your data never leaves your device.

## Development

```sh
bun install
bun run dev
```

## Deploy

```sh
vercel deploy --prod
```

## License

MIT
