import { PDFDocument } from '@cantoo/pdf-lib';

/**
 * Encrypt PDF document with user and owner passwords and permission flags
 */
export async function encryptPdfFile(file, options = {}, onProgress = () => {}) {
  const {
    userPassword = '',
    ownerPassword = '',
    allowPrinting = true,
    allowCopying = false,
    allowModifying = false
  } = options;

  if (!userPassword) {
    throw new Error('Please enter a user password to protect the document.');
  }

  onProgress(15, 'Reading PDF file...');
  const arrayBuffer = await file.arrayBuffer();

  // Load source document
  const srcDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
  
  onProgress(35, 'Creating fresh PDF container...');
  const destDoc = await PDFDocument.create();

  // Copy all pages to new document
  const pageIndices = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
  const copiedPages = await destDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => destDoc.addPage(page));

  onProgress(60, 'Applying 128-bit encryption & security locks...');

  // Configure encryption options
  const encryptOptions = {
    userPassword: userPassword,
    ownerPassword: ownerPassword || (userPassword + '_owner'),
    permissions: {
      printing: allowPrinting ? 'highResolution' : 'none',
      modifying: allowModifying,
      copying: allowCopying,
      annotating: allowModifying,
      fillingForms: allowModifying,
      contentAccessibility: true,
      documentAssembly: allowModifying
    }
  };

  destDoc.encrypt(encryptOptions);

  onProgress(85, 'Saving encrypted PDF...');
  const pdfBytes = await destDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Complete!');
  return pdfBlob;
}

/**
 * Remove password protection from encrypted PDF document
 */
export async function decryptPdfFile(file, password = '', onProgress = () => {}) {
  if (!password) {
    throw new Error('Please enter the password to unlock this document.');
  }

  onProgress(20, 'Reading protected PDF...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress(50, 'Unlocking encryption key...');
  const srcDoc = await PDFDocument.load(arrayBuffer, { password });

  onProgress(75, 'Creating unlocked PDF document...');
  const destDoc = await PDFDocument.create();
  const pageIndices = Array.from({ length: srcDoc.getPageCount() }, (_, i) => i);
  const copiedPages = await destDoc.copyPages(srcDoc, pageIndices);
  copiedPages.forEach((page) => destDoc.addPage(page));

  onProgress(90, 'Saving unlocked PDF...');
  const pdfBytes = await destDoc.save({ useObjectStreams: true });
  const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

  onProgress(100, 'Complete!');
  return pdfBlob;
}
