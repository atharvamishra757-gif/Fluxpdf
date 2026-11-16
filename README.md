# FluxPDF - Premium PDF Productivity Platform

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel&color=000)](https://your-vercel-app.vercel.app)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.5-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-0.0.0-black?style=flat-square&logo=shadcnui)](https://ui.shadcn.com/)

## 🚀 Live Demo

**Live Site:** [https://your-vercel-app.vercel.app](https://your-vercel-app.vercel.app)

## 📖 About FluxPDF

FluxPDF is a premium, all-in-one PDF productivity platform built with Next.js 16, TypeScript, Tailwind CSS, and shadcn/ui. Process PDFs directly in your browser with client-side manipulation—no uploads required for core features.

### ✨ Key Features

| Category | Tools |
|----------|-------|
| **Organize** | Merge, Split, Rotate, Organize Pages, Page Numbers, Crop |
| **Optimize** | Compress PDF |
| **Convert** | PDF to JPG, JPG to PDF |
| **Edit & Sign** | Edit PDF, Highlight & Annotate, Sign PDF, Watermark PDF, Fill Forms, Protect PDF, Unlock PDF, Redact PDF |
| **Scan** | Scan to PDF (camera capture) |

### 🔧 AI-Powered Tools (requires API key)

- **Chat with PDF** - Ask questions about your document
- **Summarize PDF** - AI-generated summaries
- **Translate PDF** - Translate between languages

### 🔒 Privacy First

All PDF processing happens **client-side** in your browser using `pdf-lib` and `pdf.js`. Your documents never leave your device unless you choose to use AI features (which require an OpenAI/OpenRouter API key).

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.4.5 | React framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | v4 | Styling |
| shadcn/ui | Latest | UI components |
| pdf-lib | 1.17.1 | PDF manipulation |
| pdf.js | Latest | PDF rendering |
| react-dropzone | Latest | File uploads |
| lucide-react | Latest | Icons |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fluxpdf.git
cd fluxpdf

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
npm run build
npm run start
```

## 📁 Project Structure

```
fluxpdf/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── editor/                  # PDF Editor
│   ├── fix-document/            # AI-powered fix tool
│   ├── tools/                   # All PDF tools
│   │   ├── crop/                # Crop PDF
│   │   ├── merge/               # Merge PDFs
│   │   ├── split/               # Split PDF
│   │   ├── rotate/              # Rotate pages
│   │   ├── compress/            # Compress PDF
│   │   ├── watermark/           # Watermark PDF
│   │   ├── page-numbers/        # Add page numbers
│   │   ├── protect/             # Protect PDF
│   │   ├── unlock/              # Unlock PDF
│   │   ├── redact/              # Redact PDF
│   │   ├── edit/                # Edit PDF
│   │   ├── sign/                # Sign PDF
│   │   ├── organize/            # Organize pages
│   │   ├── jpg-to-pdf/          # JPG to PDF
│   │   ├── pdf-to-jpg/          # PDF to JPG
│   │   ├── scan/                # Scan to PDF
│   │   ├── summarize/           # AI Summarize
│   │   ├── translate/           # AI Translate
│   │   ├── chat-pdf/            # AI Chat
│   │   └── processed/           # Processed PDFs gallery
│   └── layout.tsx               # Root layout
├── components/
│   ├── ui/                      # shadcn/ui components
│   │   ├── processed-pdfs.tsx   # Processed PDFs gallery
│   │   ├── liquid-glass-logo-reveal.tsx
│   │   └── ...
│   ├── navigation/
│   │   ├── navigation.tsx       # Navigation bar
│   │   └── logo.tsx             # FluxPDF logo
│   └── home/
│       ├── hero.tsx             # Hero section
│       ├── features.tsx         # Features section
│       ├── pricing.tsx          # Pricing section
│       ├── tools-showcase.tsx   # Tools catalog
│       └── footer.tsx           # Footer
├── lib/
│   ├── tools.ts                 # Tool definitions
│   └── utils.ts                 # Utility functions
├── types/
│   └── index.ts                 # TypeScript types
└── public/
    └── pdf.worker.mjs           # PDF.js worker
```

## 📱 Features

### 📊 Processed PDFs Gallery
View, download, and manage all your processed PDFs at `/tools/processed`. Processed files are stored locally in your browser.

### 🎨 Premium UI
- Clean, minimal design inspired by Linear and Stripe
- Dark mode support
- Responsive layout
- Gradient accents and micro-interactions

### 🔒 Security
- Client-side processing (no server uploads)
- No file storage on servers
- Optional AI features require your own API key

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [pdf-lib](https://pdf-lib.js.org/) - PDF manipulation
- [pdf.js](https://mozilla.github.io/pdf.js/) - PDF rendering
- [lucide-react](https://lucide.dev/) - Icons
- [Vercel](https://vercel.com/) - Hosting

---

**FluxPDF** - Everything you need to work with PDFs. 📄✨