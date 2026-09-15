import { PDFDocument, PageSizes } from 'pdf-lib';

/**
 * Read image file into HTML Image element to obtain natural width/height
 */
export function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve({ img, dataUrl: e.target.result });
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert an array of image files to a single clean PDF document
 */
export async function convertImagesToPdf(images, options = {}, onProgress = () => {}) {
  const {
    pageSize = 'a4', // 'a4', 'letter', 'fit'
    orientation = 'auto', // 'auto', 'portrait', 'landscape'
    margin = 15 // margin in points
  } = options;

  onProgress(10, 'Initializing PDF document...');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < images.length; i++) {
    const imgItem = images[i];
    const progressPercent = Math.round(10 + ((i + 1) / images.length) * 80);
    onProgress(progressPercent, `Processing image ${i + 1} of ${images.length}...`);

    // Prepare JPEG canvas render for rotation and format normalization
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const naturalWidth = imgItem.naturalWidth || 800;
    const naturalHeight = imgItem.naturalHeight || 600;

    // Adjust canvas dimensions for rotation
    const isRotated90 = (imgItem.rotation || 0) % 180 !== 0;
    canvas.width = isRotated90 ? naturalHeight : naturalWidth;
    canvas.height = isRotated90 ? naturalWidth : naturalHeight;

    // Apply rotation on canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(((imgItem.rotation || 0) * Math.PI) / 180);
    ctx.drawImage(
      imgItem.imgElement,
      -naturalWidth / 2,
      -naturalHeight / 2
    );

    const jpegDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    const embeddedImage = await pdfDoc.embedJpg(jpegDataUrl);

    // Page dimensions
    let pageWidth = PageSizes.A4[0];
    let pageHeight = PageSizes.A4[1];

    if (pageSize === 'letter') {
      pageWidth = PageSizes.Letter[0];
      pageHeight = PageSizes.Letter[1];
    } else if (pageSize === 'fit') {
      pageWidth = canvas.width;
      pageHeight = canvas.height;
    }

    // Adjust orientation
    if (orientation === 'landscape' || (orientation === 'auto' && canvas.width > canvas.height)) {
      if (pageWidth < pageHeight && pageSize !== 'fit') {
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      }
    }

    const newPage = pdfDoc.addPage([pageWidth, pageHeight]);

    // Calculate drawing dimensions with margins
    const availableWidth = Math.max(10, pageWidth - margin * 2);
    const availableHeight = Math.max(10, pageHeight - margin * 2);

    const imgScale = Math.min(
      availableWidth / canvas.width,
      availableHeight / canvas.height
    );

    const drawWidth = canvas.width * imgScale;
    const drawHeight = canvas.height * imgScale;

    const x = margin + (availableWidth - drawWidth) / 2;
    const y = margin + (availableHeight - drawHeight) / 2;

    newPage.drawImage(embeddedImage, {
      x,
      y,
      width: drawWidth,
      height: drawHeight
    });
  }

  onProgress(95, 'Finalizing PDF output...');
  const pdfBytes = await pdfDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Complete!');
  return pdfBlob;
}
