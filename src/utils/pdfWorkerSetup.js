import * as pdfjsLib from 'pdfjs-dist';

// Set up worker source from reliable CDN matching pdfjs-dist 3.11.174
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '3.11.174'}/build/pdf.worker.min.js`;

export default pdfjsLib;
