import React, { useEffect, useState } from 'react';
import {
  Download,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  AlertCircle,
  Printer,
} from 'lucide-react';
import { AttachedDoc } from '../types';
import {
  createDocumentBlobUrl,
  downloadDocument,
  formatDocumentSize,
  isPdfDocument,
  openDocumentInNewTab,
} from '../utils/documentViewer';
import { printDirectPdf } from '../utils/pdfRenderer';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document?: AttachedDoc | null;
  title?: string;
  applicantName?: string;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  isOpen,
  onClose,
  document,
  title = 'เอกสารแนบ',
  applicantName,
}) => {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [loadError, setLoadError] = useState<boolean>(false);

  const isPdf = isPdfDocument(document || undefined);

  useEffect(() => {
    if (!isOpen || !document?.dataUrl) {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
      return;
    }

    setZoomLevel(1);
    setRotation(0);
    setLoadError(false);

    const url = createDocumentBlobUrl(document);
    setBlobUrl(url);

    return () => {
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [isOpen, document]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !document) return null;

  const handleDownload = () => {
    downloadDocument(document);
  };

  const handleOpenInNewTab = () => {
    openDocumentInNewTab(document);
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl h-[92vh] max-h-[920px] bg-white rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-black/10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="viewer-title"
      >
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-[#F9F9FB] border-b border-black/[0.08] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 shadow-xs ${
                isPdf ? 'bg-[#FF3B30]/12 text-[#FF3B30]' : 'bg-[#007AFF]/12 text-[#007AFF]'
              }`}
            >
              {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isPdf ? 'bg-[#FF3B30]/15 text-[#FF3B30]' : 'bg-[#007AFF]/15 text-[#007AFF]'
                  }`}
                >
                  {isPdf ? 'PDF Document' : 'Image File'}
                </span>
                {applicantName && (
                  <span className="text-xs text-[#8E8E93] truncate hidden sm:inline">
                    ผู้สมัคร: <strong className="text-[#1C1C1E]">{applicantName}</strong>
                  </span>
                )}
              </div>
              <h3
                id="viewer-title"
                className="text-sm sm:text-base font-bold text-[#1C1C1E] truncate font-['Prompt',sans-serif]"
              >
                {title} • <span className="text-[#8E8E93] font-normal">{document.fileName}</span>
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                ขนาดไฟล์: {formatDocumentSize(document.fileSize)}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* New Tab Button */}
            <button
              type="button"
              onClick={handleOpenInNewTab}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1C1C1E] transition-colors cursor-pointer"
              title="เปิดดูไฟล์ในแท็บใหม่ของเบราว์เซอร์"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#007AFF]" />
              <span className="hidden md:inline">เปิดในแท็บใหม่</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              onClick={() => {
                if (isPdf && document.dataUrl) {
                  printDirectPdf(document.dataUrl);
                } else if (blobUrl) {
                  printDirectPdf(blobUrl);
                } else {
                  window.print();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FF9500]/10 hover:bg-[#FF9500]/20 text-[#D26900] transition-colors cursor-pointer"
              title="สั่งพิมพ์ไฟล์เอกสารนี้"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">พิมพ์</span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#007AFF] hover:bg-[#0062cc] text-white transition-all shadow-xs cursor-pointer active:scale-95"
              title="ดาวน์โหลดไฟล์เอกสารลงเครื่อง"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ดาวน์โหลด</span>
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-[#E5E5EA] transition-colors cursor-pointer"
              title="ปิดหน้าต่าง (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer Content */}
        <div className="flex-1 bg-[#2C2C2E]/5 overflow-auto relative flex flex-col items-center justify-center p-2 sm:p-4">
          {loadError ? (
            <div className="p-8 text-center max-w-md bg-white rounded-[20px] shadow-sm border border-black/10 space-y-4">
              <AlertCircle className="w-12 h-12 text-[#FF3B30] mx-auto" />
              <div>
                <h4 className="font-bold text-base text-[#1C1C1E]">ไม่สามารถแสดงตัวอย่างเอกสารได้</h4>
                <p className="text-xs text-[#8E8E93] mt-1">
                  ไฟล์อาจเป็นรูปแบบที่เบราว์เซอร์ไม่รองรับการแสดงผลในตัว คุณสามารถกดเปิดในแท็บใหม่หรือดาวน์โหลดลงเครื่องได้
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={handleOpenInNewTab}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#007AFF] text-white hover:bg-[#0062cc] cursor-pointer"
                >
                  เปิดในแท็บใหม่
                </button>
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 rounded-full text-xs font-semibold bg-[#F2F2F7] text-[#1C1C1E] hover:bg-[#E5E5EA] cursor-pointer"
                >
                  ดาวน์โหลดไฟล์
                </button>
              </div>
            </div>
          ) : isPdf ? (
            <div className="w-full h-full flex flex-col">
              {blobUrl ? (
                <div className="w-full h-full flex-1 rounded-[16px] overflow-hidden border border-black/10 bg-white shadow-inner relative">
                  <object
                    data={blobUrl}
                    type="application/pdf"
                    className="w-full h-full min-h-[500px]"
                    onError={() => setLoadError(true)}
                  >
                    <iframe
                      src={blobUrl}
                      title={document.fileName}
                      className="w-full h-full min-h-[500px] border-0"
                    />
                    <div className="p-8 text-center bg-white h-full flex flex-col items-center justify-center space-y-3">
                      <FileText className="w-12 h-12 text-[#FF3B30]" />
                      <p className="text-sm font-semibold text-[#1C1C1E]">
                        เบราว์เซอร์ไม่รองรับการแสดงตัวอย่าง PDF ในหน้าต่างนี้
                      </p>
                      <button
                        onClick={handleOpenInNewTab}
                        className="px-4 py-2 rounded-full bg-[#007AFF] text-white text-xs font-semibold"
                      >
                        กดที่นี่เพื่อเปิดอ่านไฟล์ PDF
                      </button>
                    </div>
                  </object>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-3 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          ) : (
            // Image Viewer with Zoom & Rotate
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
                <img
                  src={blobUrl || document.dataUrl}
                  alt={document.fileName}
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="max-h-[75vh] max-w-full object-contain rounded-[12px] shadow-lg select-none"
                  onError={() => setLoadError(true)}
                />
              </div>

              {/* Image Controls Floating Toolbar */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-black/10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-full transition-colors cursor-pointer"
                  title="ย่อขนาด"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-semibold text-[#636366] min-w-[45px] text-center">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-full transition-colors cursor-pointer"
                  title="ขยายขนาด"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-black/15 mx-1" />
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-full transition-colors cursor-pointer"
                  title="หมุน 90 องศา"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-[#1C1C1E] hover:bg-[#F2F2F7] rounded-full transition-colors cursor-pointer"
                  title="รีเซ็ตมุมมอง"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-[#F9F9FB] border-t border-black/[0.08] flex items-center justify-between text-xs text-[#8E8E93] shrink-0">
          <div className="flex items-center gap-2">
            <span>เอกสารหลักฐานประกอบการขอรับทุนการศึกษา</span>
            <span>• คณะสังคมศาสตร์ มหาวิทยาลัยนเรศวร</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full font-semibold bg-[#E5E5EA] hover:bg-[#D1D1D6] text-[#1C1C1E] transition-colors cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};
