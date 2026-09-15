import pdfjsLib from './pdfWorkerSetup';
import { PDFDocument } from 'pdf-lib';

/**
 * Utility to format bytes into readable strings
 */
export function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Apply color transformation (grayscale or monochrome B&W) to canvas image data
 */
function applyColorFilter(ctx, width, height, mode) {
  if (mode === 'color') return;

  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Luminance formula for grayscale
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

    if (mode === 'grayscale') {
      data[i] = gray;
      data[i + 1] = gray;
      data[i + 2] = gray;
    } else if (mode === 'monochrome') {
      const bw = gray > 128 ? 255 : 0;
      data[i] = bw;
      data[i + 1] = bw;
      data[i + 2] = bw;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * High-quality render of a PDF page using canvas supersampling
 */
export async function renderPdfPageToJpeg(pdfPage, options = {}) {
  const { dpi = 180, quality = 0.80, colorMode = 'color' } = options;
  const scale = dpi / 72; // High-resolution scale factor for sharp text & graphics

  const viewport = pdfPage.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });

  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);

  // Enable high-quality image smoothing for bicubic sampling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fill white background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const renderContext = {
    canvasContext: ctx,
    viewport: viewport
  };

  await pdfPage.render(renderContext).promise;

  // Apply Grayscale / Monochrome if requested
  if (colorMode !== 'color') {
    applyColorFilter(ctx, canvas.width, canvas.height, colorMode);
  }

  // Convert canvas to JPEG data URL with quality setting
  const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
  return {
    dataUrl: jpegDataUrl,
    width: pdfPage.getViewport({ scale: 1 }).width,
    height: pdfPage.getViewport({ scale: 1 }).height
  };
}

/**
 * Compress PDF document while preserving sharp text and high photo quality
 */
export async function compressPdfFile(file, options = {}, onProgress = () => {}) {
  const {
    mode = 'recommended',
    targetDpi = 180,
    jpegQuality = 0.80,
    colorMode = 'color',
    stripMetadata = true,
    targetSizeMB = 1
  } = options;

  onProgress(5, 'Analyzing PDF structure & images...');

  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const srcPdf = await loadingTask.promise;
  const totalPages = srcPdf.numPages;

  const originalSizeMB = file.size / (1024 * 1024);

  // Determine initial DPI & Quality parameters for sharp results
  let effectiveDpi = targetDpi;
  let effectiveQuality = jpegQuality;

  if (mode === 'recommended') {
    // High DPI (180 DPI) + 78% JPEG Quality: Excellent sharpness, 50-80% smaller
    effectiveDpi = 180;
    effectiveQuality = 0.78;
  } else if (mode === 'high_quality') {
    // 220 DPI + 88% JPEG Quality: Near lossless visual fidelity
    effectiveDpi = 220;
    effectiveQuality = 0.88;
  } else if (mode === 'extreme') {
    // 140 DPI + 60% JPEG Quality: Sharp text while shrinking heavily
    effectiveDpi = 140;
    effectiveQuality = 0.60;
  } else if (mode === 'target_size') {
    // Smart Adaptive calculation: aim for maximum possible quality that fits under targetSizeMB
    if (originalSizeMB > targetSizeMB) {
      const ratio = targetSizeMB / originalSizeMB;
      // Dynamically select DPI between 150 and 220
      effectiveDpi = Math.max(150, Math.min(220, Math.floor(200 * Math.sqrt(ratio))));
      // Dynamically select quality between 0.65 and 0.85
      effectiveQuality = Math.max(0.65, Math.min(0.85, 0.80 * ratio));
    } else {
      effectiveDpi = 200;
      effectiveQuality = 0.82;
    }
  }

  // Multi-pass execution helper
  const processPass = async (passDpi, passQuality) => {
    const destPdfDoc = await PDFDocument.create();

    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      const progressPercent = Math.round(10 + ((pageNum - 1) / totalPages) * 75);
      onProgress(progressPercent, `Optimizing page ${pageNum} of ${totalPages} (${passDpi} DPI)...`);

      const pdfPage = await srcPdf.getPage(pageNum);
      const { dataUrl, width, height } = await renderPdfPageToJpeg(pdfPage, {
        dpi: passDpi,
        quality: passQuality,
        colorMode: colorMode
      });

      const embeddedImage = await destPdfDoc.embedJpg(dataUrl);
      const newPage = destPdfDoc.addPage([width, height]);

      newPage.drawImage(embeddedImage, {
        x: 0,
        y: 0,
        width: width,
        height: height
      });
    }

    if (stripMetadata) {
      destPdfDoc.setTitle('');
      destPdfDoc.setAuthor('');
      destPdfDoc.setSubject('');
      destPdfDoc.setCreator('PDF Optimizer Pro');
      destPdfDoc.setProducer('PDF Optimizer Pro');
    }

    const compressedBytes = await destPdfDoc.save({ useObjectStreams: true });
    return new Blob([compressedBytes], { type: 'application/pdf' });
  };

  // Pass 1: High Quality Processing
  let finalBlob = await processPass(effectiveDpi, effectiveQuality);

  // Pass 2: Adaptive adjustment if target_size was requested and Pass 1 exceeded target limit
  const targetBytes = targetSizeMB * 1024 * 1024;
  if (mode === 'target_size' && finalBlob.size > targetBytes && originalSizeMB > targetSizeMB) {
    onProgress(88, 'Fine-tuning quality to meet target file size limit...');
    const adjustRatio = targetBytes / finalBlob.size;
    const pass2Dpi = Math.max(130, Math.floor(effectiveDpi * Math.sqrt(adjustRatio)));
    const pass2Quality = Math.max(0.55, effectiveQuality * adjustRatio);

    finalBlob = await processPass(pass2Dpi, pass2Quality);
  }

  onProgress(100, 'Complete!');

  return {
    blob: finalBlob,
    originalSize: file.size,
    compressedSize: finalBlob.size,
    savingsPercent: Math.max(0, Math.round((1 - finalBlob.size / file.size) * 100)),
    totalPages: totalPages
  };
}

/**
 * Generate preview images for side-by-side modal comparison
 */
export async function generatePagePreviews(file, pageNum = 1, options = {}) {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
  const srcPdf = await loadingTask.promise;
  
  if (pageNum < 1 || pageNum > srcPdf.numPages) {
    pageNum = 1;
  }

  const pdfPage = await srcPdf.getPage(pageNum);

  // Original render (High DPI 220)
  const original = await renderPdfPageToJpeg(pdfPage, {
    dpi: 220,
    quality: 0.95,
    colorMode: 'color'
  });

  // Compressed preview according to options
  const compressed = await renderPdfPageToJpeg(pdfPage, options);

  return {
    totalPages: srcPdf.numPages,
    originalUrl: original.dataUrl,
    compressedUrl: compressed.dataUrl
  };
}
