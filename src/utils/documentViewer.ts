/**
 * Utility functions for safe decoding, viewing, and downloading
 * student attached documents (PDF, JPG, PNG) avoiding browser
 * top-frame data URL restrictions.
 */

import { AttachedDoc } from '../types';

/**
 * Converts a base64 data URL into a standard browser Blob.
 */
export function dataUrlToBlob(dataUrl: string, fallbackMime = 'application/pdf'): Blob {
  if (!dataUrl) {
    throw new Error('ไม่พบข้อมูลไฟล์เอกสาร');
  }

  let mime = fallbackMime;
  let base64Data = dataUrl;

  if (dataUrl.includes(',')) {
    const parts = dataUrl.split(',');
    const match = parts[0].match(/:(.*?);/);
    if (match && match[1]) {
      mime = match[1];
    }
    base64Data = parts[1];
  }

  // Strip all whitespace/newlines that might corrupt atob
  const cleanBase64 = base64Data.replace(/[\r\n\s]/g, '');
  const byteCharacters = atob(cleanBase64);
  const byteNumbers = new Uint8Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteNumbers], { type: mime });
}

/**
 * Creates an object URL (blob:...) for an attached document.
 * Caller is responsible for revoking the URL when done.
 */
export function createDocumentBlobUrl(doc: { dataUrl?: string; fileType?: string }): string | null {
  if (!doc?.dataUrl) return null;
  try {
    const mime = doc.fileType || (doc.dataUrl.startsWith('data:image/') ? 'image/jpeg' : 'application/pdf');
    const blob = dataUrlToBlob(doc.dataUrl, mime);
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to create Blob URL for document:', error);
    return null;
  }
}

/**
 * Safely downloads an attached document with its original filename.
 */
export function downloadDocument(doc: { dataUrl?: string; fileName?: string; fileType?: string }): void {
  if (!doc?.dataUrl) return;
  try {
    const mime = doc.fileType || (doc.dataUrl.startsWith('data:image/') ? 'image/jpeg' : 'application/pdf');
    const blob = dataUrlToBlob(doc.dataUrl, mime);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = doc.fileName || (mime.includes('pdf') ? 'document.pdf' : 'document.jpg');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
  } catch (error) {
    console.error('Failed to download document:', error);
    // Fallback: try direct data URL download
    const link = document.createElement('a');
    link.href = doc.dataUrl;
    link.download = doc.fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Opens an attached document in a new browser tab using a safe blob URL.
 * Bypasses Chrome's block on navigating to data: URLs.
 */
export function openDocumentInNewTab(doc: { dataUrl?: string; fileName?: string; fileType?: string }): boolean {
  if (!doc?.dataUrl) return false;
  try {
    const mime = doc.fileType || (doc.dataUrl.startsWith('data:image/') ? 'image/jpeg' : 'application/pdf');
    const blob = dataUrlToBlob(doc.dataUrl, mime);
    const blobUrl = URL.createObjectURL(blob);

    // Try standard window.open with blob URL
    const newTab = window.open(blobUrl, '_blank', 'noopener,noreferrer');
    if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
      // Pop-up blocked or restricted environment; use synthetic link click
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Keep blob URL alive long enough for new tab to load
    setTimeout(() => URL.revokeObjectURL(blobUrl), 120000);
    return true;
  } catch (error) {
    console.error('Failed to open document in new tab:', error);
    // Fallback to direct download
    downloadDocument(doc);
    return false;
  }
}

/**
 * Checks if an attached doc is a PDF
 */
export function isPdfDocument(doc?: { fileType?: string; fileName?: string; dataUrl?: string }): boolean {
  if (!doc) return false;
  if (doc.fileType?.toLowerCase().includes('pdf')) return true;
  if (doc.fileName?.toLowerCase().endsWith('.pdf')) return true;
  if (doc.dataUrl?.startsWith('data:application/pdf')) return true;
  return false;
}

/**
 * Formats bytes into a human-readable size
 */
export function formatDocumentSize(bytes?: number): string {
  if (!bytes) return 'ไม่ระบุขนาด';
  if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}
