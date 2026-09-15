import pdfjsLib from './pdfWorkerSetup';
import { PDFDocument, degrees } from 'pdf-lib';
import { renderPdfPageToJpeg } from './pdfCompressor';

/**
 * Extract thumbnail previews for all pages across multiple PDF files
 */
export async function extractAllPdfPages(files, onProgress = () => {}) {
  const allPages = [];
  const totalFiles = files.length;

  for (let fileIndex = 0; fileIndex < totalFiles; fileIndex++) {
    const file = files[fileIndex];
    onProgress(Math.round((fileIndex / totalFiles) * 80), `Loading ${file.name}...`);

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
    const srcPdf = await loadingTask.promise;
    const totalPages = srcPdf.numPages;

    for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
      const pdfPage = await srcPdf.getPage(pageIndex + 1);
      
      // Render quick 96 DPI thumbnail preview
      const { dataUrl } = await renderPdfPageToJpeg(pdfPage, {
        dpi: 96,
        quality: 0.65,
        colorMode: 'color'
      });

      allPages.push({
        id: `page_${fileIndex}_${pageIndex}_${Math.random().toString(36).substring(2, 7)}`,
        fileIndex,
        fileName: file.name,
        fileBuffer: arrayBuffer,
        pageIndex,
        pageNum: pageIndex + 1,
        totalPagesInFile: totalPages,
        dataUrl,
        rotation: 0 // 0, 90, 180, 270 degrees
      });
    }
  }

  onProgress(100, 'Pages loaded!');
  return allPages;
}

/**
 * Merge selected pages in exact custom order with rotation angles
 */
export async function mergePdfPages(pages, options = {}, onProgress = () => {}) {
  onProgress(10, 'Initializing merged document...');

  const destDoc = await PDFDocument.create();

  // Cache loaded source PDFDocument objects by fileIndex
  const srcDocCache = new Map();

  for (let i = 0; i < pages.length; i++) {
    const p = pages[i];
    const progressPercent = Math.round(10 + ((i + 1) / pages.length) * 80);
    onProgress(progressPercent, `Merging page ${i + 1} of ${pages.length}...`);

    if (!srcDocCache.has(p.fileIndex)) {
      const srcDoc = await PDFDocument.load(p.fileBuffer);
      srcDocCache.set(p.fileIndex, srcDoc);
    }

    const srcDoc = srcDocCache.get(p.fileIndex);
    const [copiedPage] = await destDoc.copyPages(srcDoc, [p.pageIndex]);

    // Apply rotation if needed
    if (p.rotation && p.rotation !== 0) {
      const existingAngle = copiedPage.getRotation().angle || 0;
      copiedPage.setRotation(degrees((existingAngle + p.rotation) % 360));
    }

    destDoc.addPage(copiedPage);
  }

  onProgress(95, 'Finalizing merged PDF...');
  const mergedBytes = await destDoc.save({ useObjectStreams: true });
  const mergedBlob = new Blob([mergedBytes], { type: 'application/pdf' });

  onProgress(100, 'Complete!');
  return mergedBlob;
}
