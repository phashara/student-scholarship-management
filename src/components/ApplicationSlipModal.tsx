import React, { useEffect, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Loader2,
  Maximize2,
  Printer,
  ShieldCheck,
  User,
  X,
} from 'lucide-react';
import { AttachedDoc, ScholarshipApplication } from '../types';
import { formatThaiDateTime } from '../utils/dateUtils';
import { DocumentViewerModal } from './DocumentViewerModal';
import {
  createDocumentBlobUrl,
  downloadDocument,
  openDocumentInNewTab,
} from '../utils/documentViewer';
import {
  renderPdfPages,
  RenderedPdfPage,
  printDirectPdf,
} from '../utils/pdfRenderer';

interface ApplicationSlipModalProps {
  application: ScholarshipApplication | null;
  onClose: () => void;
  onTrackStatus?: () => void;
}

const InlinePdfViewer: React.FC<{
  doc: AttachedDoc;
  title: string;
  themeColor: 'purple' | 'blue';
  onOpenModal: () => void;
}> = ({ doc, title, themeColor, onOpenModal }) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!doc?.dataUrl) return;
    const url = createDocumentBlobUrl(doc);
    setBlobUrl(url);
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [doc]);

  const isPurple = themeColor === 'purple';

  return (
    <div className="space-y-3 pt-1">
      <div className="p-3 sm:p-4 bg-[#F8F9FA] rounded-[16px] border border-black/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-[10px] flex items-center justify-center font-bold text-xs ${
              isPurple ? 'bg-[#5856D6]/15 text-[#5856D6]' : 'bg-[#007AFF]/15 text-[#007AFF]'
            }`}
          >
            PDF
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1C1C1E]">{doc.fileName}</p>
            <p className="text-[11px] text-[#8E8E93]">
              ขนาด: {Math.round(doc.fileSize / 1024)} KB • รูปแบบ PDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenModal}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
              isPurple
                ? 'bg-[#5856D6] hover:bg-[#4745b8] text-white shadow-xs'
                : 'bg-[#007AFF] hover:bg-[#0062cc] text-white shadow-xs'
            }`}
            title="เปิดอ่านเอกสาร PDF แบบเต็มจอ"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>ขยายอ่านเต็มจอ</span>
          </button>

          <button
            type="button"
            onClick={() => printDirectPdf(doc.dataUrl)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FF9500]/10 hover:bg-[#FF9500]/20 text-[#D26900] transition-colors cursor-pointer"
            title="พิมพ์เฉพาะไฟล์ PDF นี้โดยตรง"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>พิมพ์ PDF นี้</span>
          </button>

          <button
            type="button"
            onClick={() => openDocumentInNewTab(doc)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
            title="เปิดอ่านในแท็บใหม่ของเบราว์เซอร์"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#007AFF]" />
            <span>แท็บใหม่</span>
          </button>

          <button
            type="button"
            onClick={() => downloadDocument(doc)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
            title="ดาวน์โหลดไฟล์ PDF ลงเครื่อง"
          >
            <Download className="w-3.5 h-3.5 text-[#34C759]" />
            <span>ดาวน์โหลด</span>
          </button>
        </div>
      </div>

      {blobUrl && (
        <div className="w-full h-[450px] sm:h-[550px] rounded-[14px] overflow-hidden border border-black/10 bg-white shadow-inner">
          <object data={blobUrl} type="application/pdf" className="w-full h-full">
            <iframe src={blobUrl} title={doc.fileName} className="w-full h-full border-0" />
            <div className="p-6 text-center h-full flex flex-col items-center justify-center space-y-2">
              <FileText className="w-8 h-8 text-[#007AFF]" />
              <p className="text-xs text-[#1C1C1E]">
                หากเบราว์เซอร์ไม่แสดงตัวอย่าง PDF ให้กดปุ่มด้านบนเพื่ออ่านเต็มจอ
              </p>
              <button
                type="button"
                onClick={onOpenModal}
                className="px-4 py-1.5 rounded-full bg-[#007AFF] text-white text-xs font-semibold"
              >
                เปิดอ่านเอกสาร
              </button>
            </div>
          </object>
        </div>
      )}
    </div>
  );
};

export const ApplicationSlipModal: React.FC<ApplicationSlipModalProps> = ({
  application,
  onClose,
  onTrackStatus,
}) => {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [printNotice, setPrintNotice] = useState<string | null>(null);
  const [viewingDoc, setViewingDoc] = useState<{ doc: AttachedDoc; title: string } | null>(null);

  // Rendered PDF pages for direct in-slip multi-page viewing and unified print
  const [transcriptPages, setTranscriptPages] = useState<RenderedPdfPage[]>([]);
  const [incomePages, setIncomePages] = useState<RenderedPdfPage[]>([]);
  const [isLoadingPdfPages, setIsLoadingPdfPages] = useState<boolean>(false);

  if (!application) return null;

  const isIncomeDocImage =
    application.incomeCertificateDoc?.fileType?.startsWith('image/') ||
    application.incomeCertificateDoc?.dataUrl?.startsWith('data:image/');

  const isTranscriptDocImage =
    application.academicTranscriptDoc?.fileType?.startsWith('image/') ||
    application.academicTranscriptDoc?.dataUrl?.startsWith('data:image/');

  // Convert attached PDF documents to rendered high-res pages so they print natively with the slip
  useEffect(() => {
    let isMounted = true;
    async function loadPdfPages() {
      setIsLoadingPdfPages(true);
      try {
        if (application?.academicTranscriptDoc?.dataUrl && !isTranscriptDocImage) {
          const pages = await renderPdfPages(application.academicTranscriptDoc.dataUrl, 8);
          if (isMounted) setTranscriptPages(pages);
        } else {
          if (isMounted) setTranscriptPages([]);
        }

        if (application?.incomeCertificateDoc?.dataUrl && !isIncomeDocImage) {
          const pages = await renderPdfPages(application.incomeCertificateDoc.dataUrl, 8);
          if (isMounted) setIncomePages(pages);
        } else {
          if (isMounted) setIncomePages([]);
        }
      } catch (err) {
        console.warn('PDF rendering error:', err);
      } finally {
        if (isMounted) setIsLoadingPdfPages(false);
      }
    }

    loadPdfPages();
    return () => {
      isMounted = false;
    };
  }, [
    application?.id,
    application?.academicTranscriptDoc?.dataUrl,
    application?.incomeCertificateDoc?.dataUrl,
    isTranscriptDocImage,
    isIncomeDocImage,
  ]);

  // Print / Save as PDF via native vector print engine
  const handleDownloadPdf = () => {
    setPrintNotice('ระบบเปิดหน้าต่างพิมพ์ ให้เลือกเครื่องพิมพ์ปลายทางเป็น "บันทึกเป็น PDF" (Save as PDF)');
    setTimeout(() => setPrintNotice(null), 4500);
    handlePrint();
  };

  // Robust isolated iframe printing with refined, compact typography
  const handlePrint = () => {
    const printContent = document.getElementById('printable-application-slip');
    if (!printContent) {
      window.print();
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'print-slip-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      window.print();
      return;
    }

    // Collect all stylesheets from current document
    const styleTags = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((el) => el.outerHTML)
      .join('\n');

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ใบสมัครขอรับทุนการศึกษา_${application.studentId || ''}_${application.fullName || ''}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@400;500;600;700;800&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
          ${styleTags}
          <style>
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 8.5pt;
              color: #1C1C1E;
              background: #ffffff;
              line-height: 1.35;
            }
            .print\\:hidden { display: none !important; }
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            .page-break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            .page-break-before {
              break-before: page !important;
              page-break-before: always !important;
            }
            img:not(.student-passport-photo) { max-width: 100%; height: auto; }
            .student-photo-container {
              width: 26mm !important;
              height: 34mm !important;
              min-width: 26mm !important;
              max-width: 26mm !important;
              min-height: 34mm !important;
              max-height: 34mm !important;
              overflow: hidden !important;
              border-radius: 6px !important;
              box-shadow: none !important;
            }
            .student-passport-photo {
              width: 26mm !important;
              height: 34mm !important;
              min-width: 26mm !important;
              max-width: 26mm !important;
              min-height: 34mm !important;
              max-height: 34mm !important;
              object-fit: cover !important;
              display: block !important;
            }
            img.print-page-img {
              max-width: 100% !important;
              height: auto !important;
              display: block !important;
              margin-left: auto !important;
              margin-right: auto !important;
              page-break-inside: avoid !important;
            }
          </style>
        </head>
        <body>
          <div id="printable-application-slip" class="space-y-3.5 text-[8.5pt]">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn('Iframe print failed, falling back to window.print', err);
        window.print();
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 5000);
      }
    }, 450);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto animate-fadeIn print:p-0 print:bg-white print:static print:overflow-visible">
      <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl border border-black/[0.08] overflow-hidden my-6 print:m-0 print:border-none print:shadow-none print:rounded-none print:w-full print:max-w-none">
        {/* Toast / Status Notice */}
        {printNotice && (
          <div className="print:hidden absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-[#1C1C1E] text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" />
            <span>{printNotice}</span>
          </div>
        )}

        {/* Modal Top Bar (Hidden when printing) */}
        <div className="print:hidden px-6 py-4 bg-[#1C1C1E] text-white flex items-center justify-between border-b border-white/10 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34C759]" />
            <span className="font-bold text-sm font-['Prompt',sans-serif] tracking-tight">
              ใบสมัครขอรับทุนการศึกษา ประจำปีการศึกษา {application.academicYear || '2569'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#34C759] hover:bg-[#2db24f] text-white rounded-full transition-all active:scale-95 shadow-md shadow-[#34C759]/25 cursor-pointer disabled:opacity-50"
              title="ดาวน์โหลดเป็นไฟล์ PDF ทันที"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-white" />
                  <span>บันทึกเป็น PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-[#007AFF] hover:bg-[#0066d6] text-white rounded-full transition-all active:scale-95 shadow-md shadow-[#007AFF]/25 cursor-pointer"
              title="สั่งพิมพ์ผ่านเครื่องพิมพ์ (Print Dialog)"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>สั่งพิมพ์</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/60 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Application Document */}
        <div
          id="printable-application-slip"
          className="p-4 sm:p-8 space-y-4 print:space-y-2.5 text-[#1C1C1E] text-xs sm:text-sm font-['Sarabun',sans-serif] max-h-[85vh] overflow-y-auto print:max-h-none print:overflow-visible print:p-0"
        >
          {/* Header */}
          <div className="text-center border-b-2 border-[#1C1C1E] pb-3 print:pb-2 page-break-inside-avoid">
            <div className="flex justify-center mb-1.5 print:mb-1">
              <div className="w-10 h-10 print:w-7 print:h-7 rounded-[12px] print:rounded-[6px] bg-[#1C1C1E] text-[#FF9500] flex items-center justify-center font-bold text-lg print:text-sm shadow-md print:bg-white print:border print:border-black">
                <Award className="w-5 h-5 print:w-4 print:h-4" />
              </div>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif] print:text-[11.5pt] print:leading-tight">
              แบบคำขอรับทุนการศึกษาสำหรับนิสิตที่ขาดแคลนทุนทรัพย์
            </h2>
            <h3 className="text-xs sm:text-sm font-semibold text-[#636366] print:text-[9.5pt] print:text-black">
              คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร ประจำปีการศึกษา {application.academicYear || '2569'}
            </h3>
            <div className="mt-1.5 print:mt-1 inline-flex flex-wrap items-center justify-center gap-2 text-[11px] sm:text-xs text-[#8E8E93] print:text-[8pt] print:text-black">
              <span className="px-2 py-0.5 bg-[#F2F2F7] rounded-full font-mono font-bold text-[#1C1C1E] border border-black/[0.05]">
                เลขที่ใบสมัคร: {application.id}
              </span>
              <span>วันที่บันทึก: {formatThaiDateTime(application.createdAt)}</span>
              <span className="px-2 py-0.5 rounded-full font-bold bg-[#34C759]/12 text-[#248A3D] border border-[#34C759]/30 print:bg-transparent print:border-black print:text-black">
                สถานะ: บันทึกและยื่นใบสมัครแล้ว
              </span>
            </div>
          </div>

          {/* Module 0 : การยืนยันข้อมูล */}
          <div className="bg-[#F8F9FA] rounded-[10px] p-2.5 print:p-2 border border-black/[0.06] text-xs print:text-[8pt] page-break-inside-avoid">
            <p className="font-bold text-[#1C1C1E] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#34C759] shrink-0" />
              <span>Module 0 : การยืนยันข้อมูลและรับรองความถูกต้อง</span>
            </p>
            <p className="text-[#3C4043] mt-0.5 pl-5 leading-relaxed">
              ข้าพเจ้าขอรับรองว่าข้อมูลตามแบบคำขอสมัครทุนการศึกษาเป็นข้อมูลที่ถูกต้องตามความเป็นจริงทุกประการ
              (ผ่านการยืนยันตัวตนในระบบดิจิทัลแล้ว: {application.agreedToTerms ? 'ยืนยันถูกต้องครบถ้วน' : 'ไม่ระบุ'})
            </p>
          </div>

          {/* Module 1 : ข้อมูลส่วนตัวของนิสิต พร้อมรูปภาพที่อัปโหลด */}
          <div className="page-break-inside-avoid">
            <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-2 print:text-[9pt] print:py-0.5 print:mb-1.5">
              Module 1 : ข้อมูลส่วนตัวของนิสิต
            </h4>
            <div className="flex flex-row gap-4 items-start">
              {/* 📷 รูปถ่ายนิสิตที่ Upload - ขนาดรูปติดบัตร 1 - 1.5 นิ้ว (26mm x 34mm) ไม่ใหญ่เทอะทะ */}
              <div className="shrink-0 flex flex-col items-center">
                {application.studentPhotoDoc?.dataUrl ? (
                  <div
                    className="student-photo-container rounded-[8px] overflow-hidden border border-black/20 shadow-xs bg-[#F2F2F7]"
                    style={{
                      width: '26mm',
                      height: '34mm',
                      minWidth: '26mm',
                      maxWidth: '26mm',
                      minHeight: '34mm',
                      maxHeight: '34mm',
                    }}
                  >
                    <img
                      src={application.studentPhotoDoc.dataUrl}
                      alt={application.fullName}
                      className="student-passport-photo w-full h-full object-cover"
                      style={{
                        width: '26mm',
                        height: '34mm',
                        minWidth: '26mm',
                        maxWidth: '26mm',
                        minHeight: '34mm',
                        maxHeight: '34mm',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className="student-photo-container rounded-[8px] border border-dashed border-[#8E8E93]/40 flex flex-col items-center justify-center p-1 text-center bg-[#F8F9FA]"
                    style={{
                      width: '26mm',
                      height: '34mm',
                      minWidth: '26mm',
                      maxWidth: '26mm',
                      minHeight: '34mm',
                      maxHeight: '34mm',
                    }}
                  >
                    <User className="w-5 h-5 text-[#8E8E93]/40 mb-1" />
                    <span className="text-[8px] text-[#8E8E93] leading-tight">
                      รูปถ่ายนิสิต<br />(หน้าตรง)
                    </span>
                  </div>
                )}
                <span className="text-[9px] text-[#8E8E93] mt-0.5 print:text-[7pt]">รูปถ่ายหน้าตรงชุดนิสิต</span>
              </div>

              {/* ข้อมูลประวัตินิสิต */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-1.5 gap-x-4 text-xs print:text-[8.5pt] print:gap-y-0.5 print:leading-snug">
                <p>
                  <strong>1. ชื่อ-สกุล:</strong> {application.fullName}
                </p>
                <p>
                  <strong>2. รหัสนิสิต:</strong> {application.studentId || '-'}
                </p>
                <p>
                  <strong>3. ภาควิชา:</strong> {application.department}
                </p>
                <p>
                  <strong>4. ชั้นปี:</strong> {application.studyYear}
                </p>
                <p>
                  <strong>5. เบอร์โทรศัพท์:</strong> {application.phone}
                </p>
                <p>
                  <strong>7. ผลการเรียนเฉลี่ยสะสม (GPAX):</strong> {application.gpaxRange || application.gpax || '-'}
                </p>
                <p className="sm:col-span-2">
                  <strong>6. บ้านเลขที่ ภูมิลำเนาของนิสิต:</strong> {application.homeAddress || '-'}
                </p>

                {/* สถานะเอกสารผลการเรียน */}
                <div className="sm:col-span-2 pt-0.5">
                  <strong>เอกสารผลการศึกษา:</strong>{' '}
                  {application.academicTranscriptDoc ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] bg-[#007AFF]/10 text-[#007AFF] font-medium text-xs print:bg-transparent print:text-black print:text-[8pt]">
                      <FileText className="w-3 h-3" />
                      <span>{application.academicTranscriptDoc.fileName}</span>
                      <span className="text-[10px] text-[#636366] print:text-[7.5pt]">(แนบเอกสารฉบับเต็มด้านล่าง)</span>
                    </span>
                  ) : (
                    <span className="text-[#8E8E93] text-xs print:text-[8pt]">ไม่ได้แนบไฟล์</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Module 2 : ข้อมูลครอบครัว */}
          <div className="page-break-inside-avoid">
            <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-2 print:text-[9pt] print:py-0.5 print:mb-1.5">
              Module 2 : ข้อมูลครอบครัว
            </h4>
            <div className="space-y-2 pl-1 text-xs print:text-[8.5pt] print:space-y-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[#F9F9FB] rounded-[8px] print:p-1.5">
                <p>
                  <strong>8. บิดา:</strong> {application.fatherName || '-'} ({application.fatherStatus || 'ยังมีชีวิต'}, อายุ {application.fatherAge || '-'} ปี)
                </p>
                <p>
                  <strong>อาชีพ:</strong> {application.fatherOccupation || '-'} {application.fatherOccupationDetail ? `(${application.fatherOccupationDetail})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[#F9F9FB] rounded-[8px] print:p-1.5">
                <p>
                  <strong>9. มารดา:</strong> {application.motherName || '-'} ({application.motherStatus || 'ยังมีชีวิต'}, อายุ {application.motherAge || '-'} ปี)
                </p>
                <p>
                  <strong>อาชีพ:</strong> {application.motherOccupation || '-'} {application.motherOccupationDetail ? `(${application.motherOccupationDetail})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-[#F9F9FB] rounded-[8px] print:p-1.5">
                <p>
                  <strong>10. ผู้ปกครอง:</strong> {application.guardianName || '-'} (เกี่ยวข้อง: {application.guardianRelation || '-'})
                </p>
                <p>
                  <strong>อาชีพ:</strong> {application.guardianOccupation || '-'} {application.guardianOccupationDetail ? `(${application.guardianOccupationDetail})` : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
                <p>
                  <strong>11. สถานภาพสมรสของบิดามารดา:</strong> {application.parentsMaritalStatus || '-'}
                </p>
                <p>
                  <strong>14. จำนวนพี่น้องที่กำลังศึกษา:</strong> {application.siblingsStudyingCount || '-'}
                </p>
                <p className="sm:col-span-2">
                  <strong>12. สภาพความเป็นอยู่ในครอบครัว:</strong> {application.familyLivingCondition || '-'}
                </p>
                <p className="sm:col-span-2">
                  <strong>13. การเจ็บป่วยหรือโรคประจำตัวในครอบครัว:</strong> {application.familyIllnessStatus || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Module 3 & 4 : ฐานะเศรษฐกิจ & ประวัติรับทุน */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 page-break-inside-avoid">
            <div>
              <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-1.5 print:text-[9pt] print:py-0.5">
                Module 3 : ฐานะทางเศรษฐกิจ
              </h4>
              <div className="space-y-1 text-xs print:text-[8.5pt] pl-1">
                <p>
                  <strong>15. รายได้ครอบครัว/ปี:</strong> {application.familyYearlyIncome || '-'} บาท
                </p>
                {application.incomeCertificateDoc ? (
                  <div className="mt-1 p-1.5 bg-[#007AFF]/8 rounded-[8px] border border-[#007AFF]/20 flex items-center justify-between">
                    <span className="text-[10px] text-[#007AFF] font-medium truncate max-w-[170px] print:text-black">
                      📎 {application.incomeCertificateDoc.fileName}
                    </span>
                    <span className="text-[9px] text-[#636366]">(แนบเอกสารด้านล่าง)</span>
                  </div>
                ) : (
                  <p className="text-xs text-[#8E8E93]">ไม่มีเอกสารแนบ</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-1.5 print:text-[9pt] print:py-0.5">
                Module 4 : ประวัติการได้รับทุน
              </h4>
              <div className="space-y-1 text-xs print:text-[8.5pt] pl-1">
                <p>
                  <strong>17. เงินค่าใช้จ่ายได้รับ/เดือน:</strong> {application.monthlyAllowance || '-'} บาท
                </p>
                <p>
                  <strong>18. การกู้ยืม กยศ.:</strong> {application.studentLoanStatus || '-'}
                </p>
                <p>
                  <strong>19. ทุนการศึกษาอื่น:</strong> {application.pastScholarshipHistory || '-'}
                  {application.pastScholarshipName ? ` (${application.pastScholarshipName} ${application.pastScholarshipAmount} บ.)` : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Module 5, 6, 7 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 page-break-inside-avoid">
            <div>
              <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-1.5 print:text-[9pt] print:py-0.5">
                Module 5 : ที่พักอาศัย
              </h4>
              <p className="text-xs print:text-[8.5pt] pl-1">
                <strong>20. ที่พักอาศัย:</strong> {application.accommodationType || '-'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-1.5 print:text-[9pt] print:py-0.5">
                Module 6 : การทำงานพิเศษ
              </h4>
              <p className="text-xs print:text-[8.5pt] pl-1">
                <strong>21. ประวัติทำงานพิเศษ:</strong> {application.partTimeWorkHistory || '-'}
              </p>
            </div>

            <div>
              <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-1.5 print:text-[9pt] print:py-0.5">
                Module 7 : การมีส่วนร่วม
              </h4>
              <div className="text-xs print:text-[8.5pt] pl-1 space-y-0.5">
                <p>
                  <strong>22. กิจกรรมชมรม/สโมสร:</strong> {application.studentActivityParticipation || '-'}
                </p>
                <p>
                  <strong>23. จิตอาสา/บำเพ็ญประโยชน์:</strong> {application.volunteerWorkParticipation || '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Module 8 : ความจำเป็นในการรับทุน */}
          <div className="page-break-inside-avoid">
            <h4 className="font-bold text-[#1C1C1E] text-xs sm:text-sm font-['Prompt',sans-serif] bg-[#F2F2F7] px-3 py-1 rounded-[8px] mb-2 print:text-[9pt] print:py-0.5 print:mb-1.5">
              Module 8 : ความจำเป็นในการรับทุน
            </h4>
            <div className="space-y-2 pl-1 text-xs print:text-[8.5pt]">
              <div className="bg-[#F8F9FA] p-2.5 print:p-2 rounded-[10px]">
                <p className="font-bold text-[#1C1C1E] mb-0.5">
                  24. สิ่งที่นิสิตภูมิใจในตนเอง หรือความสามารถของนิสิต:
                </p>
                <p className="text-[#3A3A3C] leading-relaxed">
                  "{application.selfPrideOrTalent || '-'}"
                </p>
              </div>

              <div className="bg-[#F8F9FA] p-2.5 print:p-2 rounded-[10px]">
                <p className="font-bold text-[#1C1C1E] mb-0.5">
                  25. เหตุผลและความจำเป็นในการรับทุนการศึกษา:
                </p>
                <p className="text-[#3A3A3C] leading-relaxed">
                  "{application.reasonForApplying || '-'}"
                </p>
              </div>

              <div className="bg-[#F8F9FA] p-2.5 print:p-2 rounded-[10px]">
                <p className="font-bold text-[#1C1C1E] mb-0.5">
                  26. หากได้รับทุนการศึกษา จะนำเงินทุนไปใช้ประโยชน์ในด้านใด อย่างไร:
                </p>
                <p className="text-[#3A3A3C] leading-relaxed">
                  "{application.scholarshipFundUsagePlan || '-'}"
                </p>
              </div>
            </div>
          </div>

          {/* Digital Certification Sign-off (ยืนยันผ่านระบบรับสมัครทุนออนไลน์) */}
          <div className="pt-3 border-t border-black/15 page-break-inside-avoid">
            <div className="bg-[#F8F9FA] p-2.5 print:p-2 rounded-[10px] border border-black/[0.06] text-xs print:text-[8pt] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#34C759] shrink-0" />
                <span className="text-[#1C1C1E] font-medium">
                  ผู้สมัครได้ยืนยันความถูกต้องของข้อมูลผ่านระบบรับสมัครทุนออนไลน์เรียบร้อยแล้ว:
                  <strong className="text-[#007AFF] ml-1">{application.fullName}</strong>
                </span>
              </div>
              <span className="font-mono text-[#8E8E93] text-[10px] print:text-[7.5pt]">
                (ยืนยันเมื่อ {formatThaiDateTime(application.createdAt)})
              </span>
            </div>
          </div>



          {/* ================================================================ */}
          {/* ข้อ 3: เอกสารแนบ 2 อย่างที่แนบมากับใบสมัคร */}
          {/* (1) ผลการเรียน (Academic Transcript) */}
          {/* (2) หนังสือรับรองรายได้ครอบครัว (Income Certificate) */}
          {/* ================================================================ */}
          <div className="page-break-before pt-4 print:pt-2 space-y-6 print:space-y-4">
            <div className="border-b-2 border-[#1C1C1E] pb-2 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold font-['Prompt',sans-serif] text-[#1C1C1E] print:text-[11pt]">
                  เอกสารแนบประกอบใบสมัครขอรับทุนการศึกษา
                </h3>
                <p className="text-xs text-[#636366] print:text-[8pt]">
                  เลขที่ใบสมัคร: <strong className="font-mono">{application.id}</strong> • นิสิต: <strong>{application.fullName}</strong> ({application.studentId})
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#F2F2F7] text-[#1C1C1E] border border-black/10 print:text-[8pt] print:py-0.5">
                เอกสารแนบ
              </span>
            </div>

            {/* เอกสารแนบ 1: ผลการเรียน (Transcript / ใบแจ้งเกรด) */}
            <div className="p-4 sm:p-5 rounded-[18px] print:rounded-[10px] bg-white border border-black/15 shadow-xs space-y-3.5 print:space-y-2.5 page-break-inside-avoid print:p-2.5">
              <div className="flex items-center justify-between border-b border-black/10 pb-2.5 print:pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-[6px] bg-[#5856D6]/15 text-[#5856D6] flex items-center justify-center font-bold text-xs">
                    1
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#1C1C1E] font-['Prompt',sans-serif] print:text-[9.5pt]">
                      เอกสารแนบ 1: ใบรายงานผลการศึกษา (Transcript / ใบแจ้งเกรด)
                    </h4>
                    <p className="text-xs text-[#8E8E93] print:text-[8pt]">
                      ผลการเรียนเฉลี่ยสะสม (GPAX): <strong>{application.gpaxRange || application.gpax || '-'}</strong>
                    </p>
                  </div>
                </div>

                {application.academicTranscriptDoc?.dataUrl && (
                  <div className="print:hidden flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingDoc({
                        doc: application.academicTranscriptDoc!,
                        title: 'ใบรายงานผลการศึกษา (Transcript / ใบแจ้งเกรด)',
                      })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#5856D6]/10 hover:bg-[#5856D6]/20 text-[#5856D6] transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>เปิดดู</span>
                    </button>
                    {!isTranscriptDocImage && (
                      <button
                        type="button"
                        onClick={() => printDirectPdf(application.academicTranscriptDoc!.dataUrl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF9500]/10 hover:bg-[#FF9500]/20 text-[#D26900] transition-colors cursor-pointer"
                        title="สั่งพิมพ์เฉพาะไฟล์ PDF นี้"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ PDF นี้</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openDocumentInNewTab(application.academicTranscriptDoc!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
                      title="เปิดในแท็บใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#007AFF]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.academicTranscriptDoc!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
                      title="ดาวน์โหลดไฟล์ PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#34C759]" />
                    </button>
                  </div>
                )}
              </div>

              {application.academicTranscriptDoc ? (
                <div className="space-y-3">
                  <div className="text-xs print:text-[8pt] text-[#636366] flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#5856D6]" />
                    <span>ชื่อไฟล์: <strong>{application.academicTranscriptDoc.fileName}</strong></span>
                    <span>• ขนาด: {Math.round(application.academicTranscriptDoc.fileSize / 1024)} KB</span>
                    {!isTranscriptDocImage && transcriptPages.length > 0 && (
                      <span className="text-[#34C759] font-medium">• พร้อมพิมพ์ {transcriptPages.length} หน้า</span>
                    )}
                  </div>

                  {isTranscriptDocImage && application.academicTranscriptDoc.dataUrl ? (
                    <div className="rounded-[10px] border border-black/10 overflow-hidden max-w-2xl mx-auto bg-[#F9F9FB] p-2 print:p-0 print:border-none">
                      <img
                        src={application.academicTranscriptDoc.dataUrl}
                        alt="ใบรายงานผลการศึกษา"
                        className="w-full h-auto max-h-[700px] object-contain rounded-[6px] print-page-img"
                      />
                    </div>
                  ) : !isTranscriptDocImage && transcriptPages.length > 0 ? (
                    <div className="space-y-4 print:space-y-3">
                      <div className="print:hidden text-xs text-[#5856D6] font-medium flex items-center justify-between bg-[#5856D6]/8 p-2.5 rounded-[10px] border border-[#5856D6]/20">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#5856D6]" />
                          <span>เรนเดอร์เอกสาร PDF พร้อมพิมพ์แล้ว ({transcriptPages.length} หน้า) — เมื่อกดสั่งพิมพ์จะพิมพ์เอกสารนี้ออกมาด้วย</span>
                        </div>
                      </div>

                      {transcriptPages.map((page) => (
                        <div key={page.pageNumber} className="space-y-1 page-break-inside-avoid print:pt-1">
                          <div className="text-[11px] print:text-[8pt] font-semibold text-[#636366] flex items-center justify-between px-1">
                            <span>หน้า {page.pageNumber} จาก {transcriptPages.length}</span>
                            <span className="font-mono text-[10px] print:text-[7.5pt]">ใบรายงานผลการศึกษา (GPAX)</span>
                          </div>
                          <div className="rounded-[10px] border border-black/15 overflow-hidden bg-white shadow-xs p-1 print:p-0 print:border-none print:shadow-none">
                            <img
                              src={page.dataUrl}
                              alt={`หน้า ${page.pageNumber}`}
                              className="w-full h-auto object-contain rounded-[6px] print-page-img"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isLoadingPdfPages ? (
                    <div className="p-6 bg-[#F8F9FA] rounded-[12px] border border-dashed border-[#8E8E93]/30 text-center text-xs flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#5856D6]" />
                      <span className="text-[#1C1C1E] font-medium">กำลังเตรียมหน้าเอกสาร PDF สำหรับแสดงผลและพิมพ์...</span>
                    </div>
                  ) : application.academicTranscriptDoc.dataUrl ? (
                    <InlinePdfViewer
                      doc={application.academicTranscriptDoc}
                      title="ใบรายงานผลการศึกษา (GPAX)"
                      themeColor="purple"
                      onOpenModal={() => setViewingDoc({
                        doc: application.academicTranscriptDoc!,
                        title: 'ใบรายงานผลการศึกษา (Transcript / ใบแจ้งเกรด)',
                      })}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="p-4 bg-[#F8F9FA] rounded-[10px] border border-dashed border-[#8E8E93]/30 text-center text-xs text-[#8E8E93]">
                  ไม่มีเอกสารใบรายงานผลการศึกษาแนบในใบสมัครนี้
                </div>
              )}
            </div>

            {/* เอกสารแนบ 2: หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน */}
            <div className="p-4 sm:p-5 rounded-[18px] print:rounded-[10px] bg-white border border-black/15 shadow-xs space-y-3.5 print:space-y-2.5 page-break-inside-avoid print:p-2.5">
              <div className="flex items-center justify-between border-b border-black/10 pb-2.5 print:pb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-[6px] bg-[#007AFF]/15 text-[#007AFF] flex items-center justify-center font-bold text-xs">
                    2
                  </span>
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-[#1C1C1E] font-['Prompt',sans-serif] print:text-[9.5pt]">
                      เอกสารแนบ 2: หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน (ใช้แบบฟอร์มเดียวกับ กยศ. ได้)
                    </h4>
                    <p className="text-xs text-[#8E8E93] print:text-[8pt]">
                      รายได้ครอบครัว/ปี: <strong>{application.familyYearlyIncome || '-'} บาท</strong>
                    </p>
                  </div>
                </div>

                {application.incomeCertificateDoc?.dataUrl && (
                  <div className="print:hidden flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setViewingDoc({
                        doc: application.incomeCertificateDoc!,
                        title: 'หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน',
                      })}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#007AFF]/10 hover:bg-[#007AFF]/20 text-[#007AFF] transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>เปิดดู</span>
                    </button>
                    {!isIncomeDocImage && (
                      <button
                        type="button"
                        onClick={() => printDirectPdf(application.incomeCertificateDoc!.dataUrl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#FF9500]/10 hover:bg-[#FF9500]/20 text-[#D26900] transition-colors cursor-pointer"
                        title="สั่งพิมพ์เฉพาะไฟล์ PDF นี้"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>พิมพ์ PDF นี้</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => openDocumentInNewTab(application.incomeCertificateDoc!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
                      title="เปิดในแท็บใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-[#007AFF]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => downloadDocument(application.incomeCertificateDoc!)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
                      title="ดาวน์โหลดไฟล์ PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#34C759]" />
                    </button>
                  </div>
                )}
              </div>

              {application.incomeCertificateDoc ? (
                <div className="space-y-3">
                  <div className="text-xs print:text-[8pt] text-[#636366] flex items-center gap-2">
                    <FileCheck2 className="w-3.5 h-3.5 text-[#007AFF]" />
                    <span>ชื่อไฟล์: <strong>{application.incomeCertificateDoc.fileName}</strong></span>
                    <span>• ขนาด: {Math.round(application.incomeCertificateDoc.fileSize / 1024)} KB</span>
                    {!isIncomeDocImage && incomePages.length > 0 && (
                      <span className="text-[#34C759] font-medium">• พร้อมพิมพ์ {incomePages.length} หน้า</span>
                    )}
                  </div>

                  {isIncomeDocImage && application.incomeCertificateDoc.dataUrl ? (
                    <div className="rounded-[10px] border border-black/10 overflow-hidden max-w-2xl mx-auto bg-[#F9F9FB] p-2 print:p-0 print:border-none">
                      <img
                        src={application.incomeCertificateDoc.dataUrl}
                        alt="หนังสือรับรองรายได้"
                        className="w-full h-auto max-h-[700px] object-contain rounded-[6px] print-page-img"
                      />
                    </div>
                  ) : !isIncomeDocImage && incomePages.length > 0 ? (
                    <div className="space-y-4 print:space-y-3">
                      <div className="print:hidden text-xs text-[#007AFF] font-medium flex items-center justify-between bg-[#007AFF]/8 p-2.5 rounded-[10px] border border-[#007AFF]/20">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-[#007AFF]" />
                          <span>เรนเดอร์เอกสาร PDF พร้อมพิมพ์แล้ว ({incomePages.length} หน้า) — เมื่อกดสั่งพิมพ์จะพิมพ์เอกสารนี้ออกมาด้วย</span>
                        </div>
                      </div>

                      {incomePages.map((page) => (
                        <div key={page.pageNumber} className="space-y-1 page-break-inside-avoid print:pt-1">
                          <div className="text-[11px] print:text-[8pt] font-semibold text-[#636366] flex items-center justify-between px-1">
                            <span>หน้า {page.pageNumber} จาก {incomePages.length}</span>
                            <span className="font-mono text-[10px] print:text-[7.5pt]">หนังสือรับรองรายได้ครอบครัว</span>
                          </div>
                          <div className="rounded-[10px] border border-black/15 overflow-hidden bg-white shadow-xs p-1 print:p-0 print:border-none print:shadow-none">
                            <img
                              src={page.dataUrl}
                              alt={`หน้า ${page.pageNumber}`}
                              className="w-full h-auto object-contain rounded-[6px] print-page-img"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : isLoadingPdfPages ? (
                    <div className="p-6 bg-[#F8F9FA] rounded-[12px] border border-dashed border-[#8E8E93]/30 text-center text-xs flex flex-col items-center justify-center space-y-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#007AFF]" />
                      <span className="text-[#1C1C1E] font-medium">กำลังเตรียมหน้าเอกสาร PDF สำหรับแสดงผลและพิมพ์...</span>
                    </div>
                  ) : application.incomeCertificateDoc.dataUrl ? (
                    <InlinePdfViewer
                      doc={application.incomeCertificateDoc}
                      title="หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน"
                      themeColor="blue"
                      onOpenModal={() => setViewingDoc({
                        doc: application.incomeCertificateDoc!,
                        title: 'หนังสือรับรองรายได้ครอบครัว / สลิปเงินเดือน',
                      })}
                    />
                  ) : null}
                </div>
              ) : (
                <div className="p-4 bg-[#F8F9FA] rounded-[10px] border border-dashed border-[#8E8E93]/30 text-center text-xs text-[#8E8E93]">
                  ไม่มีหนังสือรับรองรายได้แนบในใบสมัครนี้
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="print:hidden px-6 py-4 bg-[#F2F2F7] border-t border-black/[0.06] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#8E8E93]">
            เลขที่ใบสมัคร: <strong className="text-[#1C1C1E] font-mono">{application.id}</strong>
          </div>

          <div className="flex items-center gap-2">
            {onTrackStatus && (
              <button
                onClick={onTrackStatus}
                className="px-4 py-2 rounded-full text-xs font-semibold bg-[#007AFF]/12 hover:bg-[#007AFF]/20 text-[#007AFF] transition-colors cursor-pointer"
              >
                ตรวจสอบสถานะการสมัคร
              </button>
            )}
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#34C759] hover:bg-[#2db24f] text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-[#34C759]/25 flex items-center gap-1.5 disabled:opacity-50"
              title="ดาวน์โหลดเป็นไฟล์ PDF ทันที"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังสร้าง PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-white" />
                  <span>บันทึกเป็น PDF</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-[#007AFF] hover:bg-[#0066d6] text-white transition-all active:scale-95 cursor-pointer shadow-md shadow-[#007AFF]/25 flex items-center gap-1.5"
              title="สั่งพิมพ์ผ่านเครื่องพิมพ์ (Print Dialog)"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Document Viewer Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          document={viewingDoc.doc}
          title={viewingDoc.title}
          applicantName={application.fullName}
        />
      )}
    </div>
  );
};
