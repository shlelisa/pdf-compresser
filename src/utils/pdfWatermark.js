import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

/**
 * Apply custom text watermark and/or page numbers to PDF document
 */
export async function applyWatermarkAndPageNumbers(file, options = {}, onProgress = () => {}) {
  const {
    // Watermark Options
    watermarkText = 'CONFIDENTIAL',
    enableWatermark = true,
    watermarkFontSize = 48,
    watermarkOpacity = 0.3,
    watermarkAngle = 45, // 0, 45, 90
    watermarkColor = 'gray', // 'gray', 'red', 'blue', 'black'

    // Page Number Options
    enablePageNumbers = true,
    pageNumberPosition = 'bottom_center', // 'bottom_center', 'bottom_right', 'bottom_left', 'top_right'
    pageNumberFormat = 'page_n_of_total', // 'page_n_of_total', 'n_of_total', 'just_n'
    pageNumberFontSize = 10
  } = options;

  onProgress(10, 'Reading PDF document...');
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();
  const totalPages = pages.length;

  // Resolve color RGB
  const getColorRgb = (cName) => {
    switch (cName) {
      case 'red': return rgb(0.9, 0.2, 0.2);
      case 'blue': return rgb(0.15, 0.4, 0.9);
      case 'black': return rgb(0, 0, 0);
      case 'gray': default: return rgb(0.5, 0.5, 0.5);
    }
  };

  const wmColor = getColorRgb(watermarkColor);

  for (let i = 0; i < totalPages; i++) {
    const pageNum = i + 1;
    const progressPercent = Math.round(15 + (pageNum / totalPages) * 75);
    onProgress(progressPercent, `Processing page ${pageNum} of ${totalPages}...`);

    const page = pages[i];
    const { width, height } = page.getSize();

    // 1. Draw Text Watermark if enabled
    if (enableWatermark && watermarkText.trim() !== '') {
      const text = watermarkText.trim();
      const textWidth = helveticaBold.widthOfTextAtSize(text, watermarkFontSize);
      const textHeight = helveticaBold.heightAtSize(watermarkFontSize);

      // Center of page
      const centerX = width / 2;
      const centerY = height / 2;

      page.drawText(text, {
        x: centerX - textWidth / 2,
        y: centerY - textHeight / 4,
        size: watermarkFontSize,
        font: helveticaBold,
        color: wmColor,
        opacity: watermarkOpacity,
        rotate: degrees(watermarkAngle)
      });
    }

    // 2. Draw Page Numbers if enabled
    if (enablePageNumbers) {
      let pageStr = `Page ${pageNum} of ${totalPages}`;
      if (pageNumberFormat === 'n_of_total') {
        pageStr = `${pageNum} of ${totalPages}`;
      } else if (pageNumberFormat === 'just_n') {
        pageStr = `${pageNum}`;
      }

      const numWidth = helvetica.widthOfTextAtSize(pageStr, pageNumberFontSize);
      const margin = 20;
      let posX = width / 2 - numWidth / 2;
      let posY = margin;

      if (pageNumberPosition === 'bottom_right') {
        posX = width - numWidth - margin;
        posY = margin;
      } else if (pageNumberPosition === 'bottom_left') {
        posX = margin;
        posY = margin;
      } else if (pageNumberPosition === 'top_right') {
        posX = width - numWidth - margin;
        posY = height - margin - pageNumberFontSize;
      }

      page.drawText(pageStr, {
        x: posX,
        y: posY,
        size: pageNumberFontSize,
        font: helvetica,
        color: rgb(0.3, 0.3, 0.3),
        opacity: 0.85
      });
    }
  }

  onProgress(95, 'Saving PDF document...');
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Complete!');
  return pdfBlob;
}
