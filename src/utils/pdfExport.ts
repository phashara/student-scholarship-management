import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Generates a clean, sanitized filename based on student's full name.
 * Format: [ชื่อ-นามสกุลนิสิต].pdf (Option 2)
 */
export function getStudentPdfFileName(fullName?: string, fallbackStudentId?: string): string {
  const rawName = (fullName || '').trim() || (fallbackStudentId || '').trim() || 'นิสิต';
  // Strip characters illegal in filesystem names across OS
  const cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '_').trim();
  return `${cleanName}.pdf`;
}

/**
 * Exports an HTML element directly as a downloaded PDF file to user's computer.
 */
export async function downloadElementAsPdf(
  elementId: string,
  fileName: string
): Promise<boolean> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found`);
    return false;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution for crisp Sarabun / Prompt Thai text
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (clonedEl) {
          clonedEl.style.maxHeight = 'none';
          clonedEl.style.overflow = 'visible';
          clonedEl.style.height = 'auto';
        }
      },
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 mm width
    const pageHeight = 297; // A4 mm height

    // Calculate height of image in mm proportional to A4 width
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    if (imgHeight <= pageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pageWidth, imgHeight, undefined, 'FAST');
    } else {
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}
