# PDF Optimizer Pro & Document Suite 🚀

An all-in-one, high-performance, **100% client-side PDF and document processing tool suite** built with React, Vite, and modern Web APIs. All file processing happens locally inside your web browser — **zero files are ever uploaded to any server**, ensuring maximum privacy and data security.

![License](https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5.1-purple?style=for-the-badge&logo=vite)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)
![Design](https://img.shields.io/badge/Theme-Blue%20%7C%20White%20%7C%20Slate-slate?style=for-the-badge)

---

## 🌟 Key Features

### 1. ⚡ High-DPI PDF Compressor
* **Adaptive Multi-Pass Compression**: Intelligently compresses heavy PDFs using high-DPI rendering (180–220 DPI) and JPEG quality scaling.
* **Fit Under 1 MB Preset**: One-click target size mode ideal for job applications, university portals, and government uploads with strict file size caps.
* **Side-by-Side Visual Preview**: Compare original vs. compressed quality page-by-page before saving.
* **Custom Options**: Adjust target DPI, JPEG quality, color/grayscale mode, and metadata stripping.

### 2. 🔀 PDF Merger & Page Organizer
* **Combine Multiple PDFs**: Merge unlimited PDF files into a single document.
* **Individual Page Control**: Drag & drop page reordering, rotate individual pages by 90°, or delete unwanted pages.
* **Visual Thumbnails**: Real-time rendering of page previews for easy organization.

### 3. 📄 Word / Text to PDF Converter
* **Multi-Format Support**: Convert Word documents (`.docx`), plain text (`.txt`), Markdown (`.md`), HTML (`.html`), JSON, CSV, logs, and code files directly to PDF.
* **Standard A4 Layout**: Formats documents into exact ISO A4 proportions with standard **0.75-inch (19mm)** uniform margins and clean typography.
* **Preserves Word Formatting**: Retains headings (`H1`-`H3`), bullet lists, bold text, blockquotes, and tables via `mammoth.js`.

### 4. 📝 PDF to Word (.docx) Converter
* **100% Full-Color & Layout Preservation**: Extracts vector graphics, background colors, custom logos, tables, and page design into Microsoft Word DrawingML (`<w:drawing>`).
* **Editable Text Content**: Extracts structured paragraphs and line breaks under each page section for editing in Word.
* **Native OpenXML ZIP Package**: Generates compliant `.docx` ZIP archives (`word/document.xml`, `[Content_Types].xml`), opening in Microsoft Word with **zero recovery warnings or format error prompts**.

### 5. 🖼️ Images to PDF Converter
* **Multi-Format Image Support**: Convert JPG, PNG, WebP, and GIF photos/scans into clean multi-page PDFs.
* **Layout Controls**: Custom page orientation (Portrait / Landscape), page margins (Fit Page / Standard / No Margin), and image ordering.

### 6. ✍️ Digital Signature & Stamp Tool
* **Interactive Canvas Pad**: Draw digital signatures directly on an interactive canvas with customizable ink colors (Black, Blue, Red) and stroke thickness.
* **Image Stamp Upload**: Upload official company stamps, seals, or signature images (PNG/JPG).
* **Precise Placement**: Scale, position, and stamp onto any page of your PDF document.

### 7. 🔖 Watermark & Page Numbers
* **Custom Text Watermarks**: Add text overlays (e.g. `CONFIDENTIAL`, `DRAFT`, `DO NOT COPY`) with adjustable opacity, text color, font size, and rotation angle.
* **Dynamic Page Numbering**: Insert automatic page numbers (`Page X of Y`) at the bottom header/footer of every page.

### 8. 🔒 PDF Password Encryption & Security
* **128-bit AES Encryption**: Lock PDFs with User and Owner passwords powered by `@cantoo/pdf-lib`.
* **Permissions Control**: Restrict printing, copying text, modifying content, and extracting pages.

---

## 🎨 Design System & Aesthetics

* **Color Palette**: Curated **Blue (`#2563eb`), White (`#ffffff`), and Slate (`#0f172a` / `#f8fafc`)** color system.
* **Dual Theme Engine**: Seamless toggle between **Dark Slate** and **Light Slate** modes with `localStorage` persistence.
* **Glassmorphism & Micro-Animations**: Smooth UI transitions, frosted glass panels, responsive hover states, and live processing spinners.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Core** | React 18, Vite 5, JavaScript (ESNext) |
| **PDF Manipulation** | `@cantoo/pdf-lib`, `pdf-lib` |
| **PDF Text & Canvas Rendering** | `pdfjs-dist`, `html2canvas` |
| **Word & ZIP Processing** | `mammoth.js`, `JSZip` |
| **Styling & Icons** | Vanilla CSS (CSS Variables, Flexbox/Grid), `lucide-react` |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** (v9.0.0 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/shlelisa/pdf-compresser.git
cd pdf-compresser
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:3000/`.

### 4. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

---

## 🌐 Deploy to Vercel

Deploying this app to **Vercel** takes less than a minute. Choose one of the deployment options below:

### Option A: One-Click Deploy Button
Click the button below to fork and deploy directly to your Vercel account:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fshlelisa%2Fpdf-compresser)

---

### Option B: Deploy via Vercel Dashboard (Git)

1. Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **"Add New..."** → **"Project"**.
3. Import your GitHub repository (`shlelisa/pdf-compresser`).
4. Vercel automatically detects **Vite** configuration:
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
5. Click **"Deploy"**. Your app will be live on a custom `.vercel.app` URL!

---

### Option C: Deploy via Vercel CLI

1. Install the Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```
2. Run the deployment command in the project directory:
   ```bash
   vercel
   ```
3. To deploy directly to production:
   ```bash
   vercel --prod
   ```

---

## 🔒 Privacy & Security Guarantee

This application runs **entirely in the user's web browser**:
* ❌ No server uploads or cloud API calls.
* ❌ No analytics tracking or data collection.
* ❌ No third-party network requests during file processing.
* ✅ 100% confidential and safe for sensitive legal, financial, or personal documents.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
