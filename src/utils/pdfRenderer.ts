/**
 * Utility to render PDF data URLs into high-resolution images (canvas -> dataUrl)
 * so they can be viewed and printed natively in web browsers alongside the application slip.
 */

import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure the worker source for PDF.js safely
try {
  if (typeof window !== 'undefined' && pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
    if (typeof pdfjsWorker === 'string' && pdfjsWorker.length > 0) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    }
  }
} catch (e) {
  console.warn('PDF.js worker initialization bypassed:', e);
}

/**
 * Converts a base64 Data URL to a Uint8Array
 */
function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64Index = dataUrl.indexOf(';base64,');
  const base64 = base64Index !== -1 ? dataUrl.substring(base64Index + 8) : dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export interface RenderedPdfPage {
  pageNumber: number;
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Render all or up to `maxPages` of a PDF to high-resolution PNG data URLs.
 * Uses a scale of 1.75 to ensure crisp print quality without excessive memory usage.
 */
export async function renderPdfPages(
  pdfDataUrl: string,
  maxPages = 8
): Promise<RenderedPdfPage[]> {
  try {
    const pdfData = dataUrlToUint8Array(pdfDataUrl);
    const loadingTask = pdfjsLib.getDocument({
      data: pdfData,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
      cMapPacked: true,
    });

    const pdfDocument = await loadingTask.promise;
    const pageCount = Math.min(pdfDocument.numPages, maxPages);
    const renderedPages: RenderedPdfPage[] = [];

    for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      // Scale 1.75 delivers ~150-200 DPI suitable for sharp A4 printing
      const viewport = page.getViewport({ scale: 1.75 });

      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const canvasContext = canvas.getContext('2d');
      if (!canvasContext) continue;

      const renderContext = {
        canvasContext,
        viewport,
        canvas,
      };

      await page.render(renderContext).promise;
      const pageDataUrl = canvas.toDataURL('image/png', 0.92);

      renderedPages.push({
        pageNumber: pageNum,
        dataUrl: pageDataUrl,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return renderedPages;
  } catch (error) {
    console.error('Failed to render PDF pages:', error);
    return [];
  }
}

/**
 * Directly prints a PDF by loading it into a temporary hidden iframe
 * and triggering the browser's print dialog, with fallback to new tab.
 */
export function printDirectPdf(pdfDataUrl?: string | null): void {
  if (!pdfDataUrl) return;
  try {
    // If it's a blob url or data url
    const iframe = document.createElement('iframe');

    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.src = pdfDataUrl;

    document.body.appendChild(iframe);

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch {
          // Fallback: open in new tab
          window.open(pdfDataUrl, '_blank');
        } finally {
          setTimeout(() => {
            if (document.body.contains(iframe)) {
              document.body.removeChild(iframe);
            }
          }, 60000);
        }
      }, 500);
    };
  } catch {
    window.open(pdfDataUrl, '_blank');
  }
}
