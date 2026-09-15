import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

// Set pdfjs worker path
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '3.11.174'}/pdf.worker.min.js`;
}

/**
 * Convert PDF into a 100% full-color, layout-preserved OpenXML Word (.docx) document
 */
export async function convertPdfToDocx(file, onProgress = () => {}) {
  onProgress(5, 'Opening PDF document...');
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  const zip = new JSZip();
  const wordFolder = zip.folder('word');
  const mediaFolder = wordFolder.folder('media');

  let docRelsList = [
    `<Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>`
  ];

  let bodyXmlElements = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    onProgress(
      Math.round(10 + (pageNum / numPages) * 75),
      `Rendering full color design for page ${pageNum} of ${numPages}...`
    );

    const page = await pdf.getPage(pageNum);
    
    // 1. Render high-res canvas (2.0 scale = 192-200 DPI for crisp colors & design)
    const viewport = page.getViewport({ scale: 2.0 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d', { alpha: false });

    // Fill white background before rendering PDF content
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: ctx,
      viewport: viewport
    }).promise;

    // Convert high-res canvas page render to JPEG Blob / ArrayBuffer
    const imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const base64Data = imgDataUrl.replace(/^data:image\/jpeg;base64,/, '');

    const imgFileName = `image_${pageNum}.jpg`;
    const rIdImg = `rIdImg_${pageNum}`;

    // Add image to word/media/
    mediaFolder.file(imgFileName, base64Data, { base64: true });

    // Add relationship for image
    docRelsList.push(
      `<Relationship Id="${rIdImg}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imgFileName}"/>`
    );

    // Calculate dimensions in OpenXML EMUs (1 inch = 914400 EMUs)
    // Printable A4 width: ~6.25 inches (5715000 EMUs)
    const emuWidth = 5715000;
    const emuHeight = Math.round(emuWidth * (viewport.height / viewport.width));

    // 2. Add Full-Color Page Drawing element in Word XML
    bodyXmlElements.push(`
      <w:p>
        <w:pPr>
          <w:jc w:val="center"/>
          <w:spacing w:before="120" w:after="200"/>
        </w:pPr>
        <w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
              <wp:extent cx="${emuWidth}" cy="${emuHeight}"/>
              <wp:docPr id="${pageNum}" name="Page Design ${pageNum}"/>
              <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                    <pic:nvPicPr>
                      <pic:cNvPr id="${pageNum}" name="Page ${pageNum}"/>
                      <pic:cNvPicPr/>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="${rIdImg}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="${emuWidth}" cy="${emuHeight}"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>
      </w:p>
    `);

    // 3. Extract text items for text editing under the design image
    const textContent = await page.getTextContent();
    const items = textContent.items;

    if (items && items.length > 0) {
      bodyXmlElements.push(`
        <w:p>
          <w:pPr>
            <w:spacing w:before="100" w:after="80"/>
          </w:pPr>
          <w:r>
            <w:rPr>
              <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
              <w:b/>
              <w:sz w:val="20"/>
              <w:color w:val="2563EB"/>
            </w:rPr>
            <w:t xml:space="preserve">--- Page ${pageNum} Extracted Text ---</w:t>
          </w:r>
        </w:p>
      `);

      const linesMap = new Map();
      for (const item of items) {
        if (!item.str || item.str.trim() === '') continue;
        const y = Math.round(item.transform[5] / 4) * 4;
        if (!linesMap.has(y)) linesMap.set(y, []);
        linesMap.get(y).push({ x: item.transform[4], text: item.str });
      }

      const sortedY = Array.from(linesMap.keys()).sort((a, b) => b - a);
      for (const yKey of sortedY) {
        const lineText = linesMap.get(yKey).sort((a, b) => a.x - b.x).map((it) => it.text).join(' ');
        if (lineText.trim()) {
          bodyXmlElements.push(`
            <w:p>
              <w:pPr>
                <w:spacing w:after="120" w:line="240" w:lineRule="auto"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                  <w:sz w:val="20"/>
                  <w:color w:val="334155"/>
                </w:rPr>
                <w:t xml:space="preserve">${escapeXml(lineText)}</w:t>
              </w:r>
            </w:p>
          `);
        }
      }
    }

    // Page break except last page
    if (pageNum < numPages) {
      bodyXmlElements.push(`
        <w:p>
          <w:r>
            <w:br w:type="page"/>
          </w:r>
        </w:p>
      `);
    }
  }

  onProgress(88, 'Packing full-color OpenXML Word document (.docx)...');

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpg" ContentType="image/jpeg"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.folder('_rels').file(
    '.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/_rels/document.xml.rels
  wordFolder.folder('_rels').file(
    'document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${docRelsList.join('\n  ')}
</Relationships>`
  );

  // 4. word/styles.xml
  wordFolder.file(
    'styles.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults>
    <w:rPrDefault>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
        <w:color w:val="0F172A"/>
      </w:rPr>
    </w:rPrDefault>
  </w:docDefaults>
</w:styles>`
  );

  // 5. word/document.xml
  wordFolder.file(
    'document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document 
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"
  xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    ${bodyXmlElements.join('\n')}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  onProgress(95, 'Finalizing download...');
  const docxBlob = await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });

  onProgress(100, 'Complete!');
  return docxBlob;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
