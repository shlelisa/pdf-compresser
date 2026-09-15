import { PDFDocument } from '@cantoo/pdf-lib';

/**
 * Apply drawn or uploaded image signature/stamp to PDF document
 */
export async function signPdfDocument(file, signatureDataUrl, options = {}, onProgress = () => {}) {
  const {
    targetPage = 1, // 1-indexed, or 'all'
    position = 'bottom_right', // 'bottom_right', 'bottom_left', 'bottom_center', 'top_right', 'center'
    scale = 0.35 // scale factor relative to page width
  } = options;

  if (!signatureDataUrl) {
    throw new Error('Please draw or upload a signature first.');
  }

  onProgress(15, 'Reading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

  onProgress(40, 'Embedding digital signature...');
  const signatureImage = await pdfDoc.embedPng(signatureDataUrl);
  const imgDims = signatureImage.scale(1);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // Determine pages to sign
  let pagesToSign = [];
  if (targetPage === 'all') {
    pagesToSign = pages;
  } else {
    const pageIndex = Math.max(0, Math.min(totalPages - 1, targetPage - 1));
    pagesToSign = [pages[pageIndex]];
  }

  onProgress(70, 'Positioning signature on document...');

  pagesToSign.forEach((page) => {
    const { width, height } = page.getSize();

    // Calculate signature dimensions based on scale percentage of page width
    const targetWidth = width * scale;
    const aspectRatio = imgDims.height / imgDims.width;
    const targetHeight = targetWidth * aspectRatio;

    const margin = 30;
    let x = width - targetWidth - margin;
    let y = margin;

    if (position === 'bottom_left') {
      x = margin;
      y = margin;
    } else if (position === 'bottom_center') {
      x = (width - targetWidth) / 2;
      y = margin;
    } else if (position === 'top_right') {
      x = width - targetWidth - margin;
      y = height - targetHeight - margin;
    } else if (position === 'center') {
      x = (width - targetWidth) / 2;
      y = (height - targetHeight) / 2;
    }

    page.drawImage(signatureImage, {
      x,
      y,
      width: targetWidth,
      height: targetHeight
    });
  });

  onProgress(90, 'Saving signed PDF document...');
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Complete!');
  return pdfBlob;
}
