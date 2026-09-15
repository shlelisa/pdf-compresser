import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { PDFDocument, PageSizes } from '@cantoo/pdf-lib';

/**
 * Convert Word Document (.docx) or Text (.txt) file into a clean PDF document
 */
export async function convertDocToPdf(file, options = {}, onProgress = () => {}) {
  const fileName = file.name.toLowerCase();
  const ext = fileName.slice(fileName.lastIndexOf('.'));
  const isDocx = ext === '.docx';
  
  onProgress(10, `Reading ${isDocx ? 'Word document' : 'text document'}...`);
  const arrayBuffer = await file.arrayBuffer();

  let htmlContent = '';

  if (isDocx) {
    onProgress(25, 'Parsing Word formatting & headings...');
    const result = await mammoth.convertToHtml({ arrayBuffer });
    htmlContent = result.value || '<p>Empty Document</p>';
  } else {
    onProgress(25, 'Formatting text document...');
    const rawText = new TextDecoder('utf-8').decode(arrayBuffer);
    
    if (ext === '.html' || ext === '.htm') {
      htmlContent = rawText;
    } else {
      const paragraphs = rawText.split(/\r?\n/).map((line) => line.trim());
      htmlContent = paragraphs
        .map((p) => (p === '' ? '<br/>' : `<p style="margin-bottom: 0.6em; line-height: 1.6; color: #1e293b;">${escapeHtml(p)}</p>`))
        .join('');
    }
  }

  onProgress(50, 'Rendering document pages...');

  // Create temporary container element for high-res A4 rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px'; // Standard A4 width at 96 DPI (210mm)
  container.style.minHeight = '1123px'; // Standard A4 height at 96 DPI (297mm)
  container.style.padding = '54px 54px'; // Standard 0.75-inch (19mm) margins on all sides
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = "'Inter', system-ui, -apple-system, sans-serif";
  container.style.fontSize = '14px';
  container.style.lineHeight = '1.65';
  container.style.boxSizing = 'border-box';

  // Inject custom stylesheet for Word HTML rendering
  container.innerHTML = `
    <style>
      h1 { font-size: 24px; color: #0f172a; margin-top: 1em; margin-bottom: 0.5em; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
      h2 { font-size: 20px; color: #1e293b; margin-top: 0.9em; margin-bottom: 0.4em; font-weight: 700; }
      h3 { font-size: 16px; color: #334155; margin-top: 0.8em; margin-bottom: 0.3em; font-weight: 600; }
      p { margin-bottom: 0.8em; line-height: 1.65; color: #334155; }
      ul, ol { margin-left: 1.5em; margin-bottom: 0.8em; }
      li { margin-bottom: 0.3em; color: #334155; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 1em; }
      th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
      th { background-color: #f1f5f9; font-weight: 600; }
      strong { color: #0f172a; }
      blockquote { border-left: 4px solid #3b82f6; padding-left: 1rem; color: #475569; font-style: italic; margin-bottom: 1em; }
    </style>
    <div>${htmlContent}</div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // 2x scale for high DPI sharpness
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });

    onProgress(80, 'Generating PDF pages...');

    const pdfDoc = await PDFDocument.create();

    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const embeddedImg = await pdfDoc.embedJpg(imgDataUrl);

    const a4Width = PageSizes.A4[0];
    const a4Height = PageSizes.A4[1];

    // Calculate how many A4 pages are needed to accommodate the rendered content
    const totalRenderedHeight = (canvas.height / canvas.width) * a4Width;
    let remainingHeight = totalRenderedHeight;
    let pageOffset = 0;

    while (remainingHeight > 0) {
      const page = pdfDoc.addPage([a4Width, a4Height]);
      
      page.drawImage(embeddedImg, {
        x: 0,
        y: a4Height - totalRenderedHeight + pageOffset,
        width: a4Width,
        height: totalRenderedHeight
      });

      pageOffset += a4Height;
      remainingHeight -= a4Height;
    }

    onProgress(95, 'Saving PDF...');
    const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    onProgress(100, 'Complete!');
    return pdfBlob;
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
