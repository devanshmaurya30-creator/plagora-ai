# Plagora AI — AI-Powered Plagiarism & Originality Analysis Platform

**Plagora AI** is an enterprise-grade AI plagiarism detection and document intelligence platform. Designed with a pure black cinematic visual system (`#000000`), fluid physics, and real multi-detector engines, Plagora AI evaluates exact string copy-pasting, structural paraphrasing, and deep semantic vector similarity across indexed database corpora and live web verification APIs.

---

## 🌟 Key Features & Capabilities

- **Multi-Pass Plagiarism Engine**:
  - **Exact String & N-Gram Matching**: Client-side deterministic string normalization and n-gram overlap detection.
  - **Near Match & Repeated Content Auditing**: Detects intra-document phrase repetitions and structural variations.
  - **Deep Semantic Similarity**: Server-side Gemini 2.5 AI vector embeddings evaluation.
  - **Paraphrase Recognition**: Identifies concept rewordings and structural syntax changes.
  - **Live Web Verification**: Real Google Search Grounding web verification with URL sanitization and source evidence.

- **Live Analysis Activity Panel**:
  - 9-stage pipeline visualization (Uploading Document → Extracting Text → Normalizing Content → Finding Exact Matches → Finding Near Matches → Analyzing Paraphrases → Semantic Similarity Analysis → Web Verification → Building Report).
  - Real-time state machine (`PENDING`, `ACTIVE`, `COMPLETED`, `FAILED`), live timer, and step counter.

- **AI Match Explanation ("Why Was This Flagged?")**:
  - Answers why passages were flagged with factual evidence factors (textual similarity, n-gram matching, paraphrased structure, semantic vector alignment, web verification).
  - Strictly adheres to professional language standards (*"Potentially similar content"*, *"Potential match"*, *"High similarity detected"*).

- **Match Navigation & Side-by-Side Comparison**:
  - Counter navigation (`MATCH 1 / 18`) withPrev/Next controls and keyboard shortcuts (`N`, `P`, `Esc`).
  - Dual-column evidence comparison (`YOUR DOCUMENT PASSAGE` vs `VERIFIED REFERENCE MATCH`) with optional synchronized scrolling.

- **Separate AI Confidence Meter**:
  - Visually and conceptually separates **AI Confidence** (Low, Medium, High 3-bar meter) from Similarity %.

- **In-Document Search (`Ctrl+F`)**:
  - Fast text search inside document viewer with match counter (`3 of 12`), Next/Prev navigation, and cyan search highlights.

- **Enterprise PDF Similarity Audit Generator**:
  - Multi-page business-grade PDF export (`Plagora_AI_Similarity_Audit_[DocumentName].pdf`) featuring executive summaries, category progress bars, side-by-side evidence boxes, verified web sources, and mandatory legal disclaimers.

- **Privacy & Governance Center**:
  - Local client-side document parsing (PDF, DOCX, TXT), isolated server-side API key protection, temporary localStorage management, and data purge controls.

- **Global Motion & Interaction Engine**:
  - Tactile click physics (`scale: 0.96`), click ripple system, magnetic CTA buttons, 3D card depth with simulated specular lighting, velocity-reactive cursor spotlight, and `prefers-reduced-motion` compliance.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Vite, TailwindCSS (v4), Framer Motion, Lucide Icons.
- **Backend API**: Node.js, Express, `@google/genai` (Gemini 2.5 SDK), Google Search Grounding.
- **Document Processing**: `pdfjs-dist` (locally bundled worker), `mammoth` (DOCX parser).
- **PDF Generation**: `jspdf`, `html2canvas`, `dompurify`.
- **PWA**: Web App Manifest (`manifest.json`), Service Worker (`sw.js`).

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn

### 1. Environment Setup

Create a `.env` file in the root directory (never commit this file):

```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3001
```

> **Note**: `GEMINI_API_KEY` is strictly isolated on the backend Node server environment and is **never** sent or exposed to the client browser bundle.

### 2. Install Dependencies

```bash
npm install
```

### 3. Running Locally

Start the Express API backend server (port 3001):
```bash
npm run server
```

In a separate terminal, start the Vite frontend dev server (port 5173):
```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

### 4. Production Build & Type Checking

```bash
npm run build
```

To run the production build check:
- `tsc -b`: Compiles TypeScript without emit errors.
- `vite build`: Packages production assets cleanly into `dist/`.

---

## 🔒 Security & Privacy Architecture

1. **API Key Isolation**: `process.env.GEMINI_API_KEY` is evaluated solely on the backend Express server (`server/index.ts` & `server/services/geminiService.ts`). The client bundle contains **0** references to secrets.
2. **Safe URL Handling**: Web verification links are strictly validated against `http://` and `https://` protocols with `target="_blank"` and `rel="noopener noreferrer"`.
3. **Request Rate Limiting**: Backend API endpoints feature sliding-window rate limiters (60 requests per 15-minute window per IP) to prevent API abuse.
4. **Local Document Worker**: PDF extraction uses locally bundled PDF.js worker assets (`pdf.worker.min.mjs?url`), preventing reliance on remote cdnjs workers.

---

## 📄 License & Ownership

© 2026 Devansh Maurya Inc. All rights reserved.
