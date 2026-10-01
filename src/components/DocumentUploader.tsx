import React, { useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  FileCheck,
  FileText,
  Image as ImageIcon,
  Trash2,
  UploadCloud,
  ZoomIn,
} from 'lucide-react';
import { AttachedDoc } from '../types';

interface ImageCompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compress an image file to keep base64 data URL compact and lightning-fast
 */
function compressImage(file: File, options: ImageCompressOptions = {}): Promise<string> {
  const { maxWidth = 1000, maxHeight = 1000, quality = 0.8 } = options;
  return new Promise((resolve, reject) => {
    // If it's a PDF or non-image, just read as dataURL directly
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Use JPEG for optimal photo compression, PNG for transparency
        const format = file.type === 'image/png' ? 'image/jpeg' : file.type;
        const compressedDataUrl = canvas.toDataURL(format, quality);
        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(event.target?.result as string);
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface DocumentUploaderProps {
  id: string;
  label?: string;
  title?: string;
  sublabel?: string;
  description?: string;
  accept?: string;
  required?: boolean;
  doc?: AttachedDoc;
  value?: AttachedDoc;
  onChange: (doc: AttachedDoc | undefined) => void;
  isPhoto?: boolean; // Specialized mode for student portrait photo
  aspectRatio?: 'square' | 'portrait' | 'auto';
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  id,
  label,
  title,
  sublabel,
  description,
  accept = '.pdf,.jpg,.jpeg,.png',
  required = false,
  doc,
  value,
  onChange,
  isPhoto = false,
}) => {
  const activeDoc = doc || value;
  const displayTitle = label || title || '';
  const displayDescription = sublabel || description || '';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsProcessing(true);
    try {
      // Compress image for optimal performance and storage
      const dataUrl = await compressImage(file, {
        maxWidth: isPhoto ? 600 : 1200,
        maxHeight: isPhoto ? 800 : 1600,
        quality: 0.82,
      });

      onChange({
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        dataUrl,
        uploadedAt: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      });
    } catch (err) {
      console.error('File read error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${Math.round(bytes / 1024)} KB`;
  };

  const isImageFile =
    activeDoc?.fileType?.startsWith('image/') ||
    activeDoc?.dataUrl?.startsWith('data:image/');

  return (
    <div className="rounded-[22px] bg-[#F2F2F7]/80 p-4 border border-black/[0.05] transition-all">
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div>
          <label htmlFor={id} className="text-xs sm:text-sm font-semibold text-[#1C1C1E] flex items-center gap-1">
            <span>{displayTitle}</span>
            {required ? (
              <span className="text-[#FF3B30] text-xs font-bold">*</span>
            ) : (
              <span className="text-[#8E8E93] text-[11px] font-normal">(ถ้ามี)</span>
            )}
          </label>
          {displayDescription && (
            <p className="text-[11px] text-[#8E8E93] mt-0.5 leading-relaxed">{displayDescription}</p>
          )}
        </div>

        {activeDoc && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/15 text-[#248A3D] shrink-0">
            <CheckCircle2 className="w-3 h-3 text-[#34C759]" />
            <span>อัปโหลดแล้ว</span>
          </span>
        )}
      </div>

      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {isProcessing ? (
        <div className="flex items-center justify-center p-6 bg-white rounded-[16px] border border-black/[0.05]">
          <div className="flex items-center gap-2 text-xs text-[#007AFF] font-medium">
            <div className="w-4 h-4 border-2 border-[#007AFF] border-t-transparent rounded-full animate-spin" />
            <span>กำลังประมวลผลไฟล์...</span>
          </div>
        </div>
      ) : activeDoc ? (
        <div className="p-3 bg-white rounded-[18px] border border-black/[0.06] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {isImageFile && activeDoc.dataUrl ? (
                <div className="relative w-14 h-16 rounded-[12px] overflow-hidden bg-[#F2F2F7] border border-black/[0.08] shrink-0 shadow-xs">
                  <img
                    src={activeDoc.dataUrl}
                    alt={activeDoc.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-11 h-11 rounded-[14px] bg-[#007AFF]/12 text-[#007AFF] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#1C1C1E] truncate max-w-[200px] sm:max-w-xs">
                  {activeDoc.fileName}
                </p>
                <p className="text-[11px] text-[#8E8E93]">
                  {formatSize(activeDoc.fileSize)} • เมื่อ {activeDoc.uploadedAt}
                </p>
                {activeDoc.dataUrl && (
                  <a
                    href={activeDoc.dataUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#007AFF] font-semibold hover:underline mt-0.5"
                  >
                    <span>เปิดดูตัวอย่างไฟล์</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#007AFF] bg-[#007AFF]/10 hover:bg-[#007AFF]/20 rounded-full transition-colors"
                title="เปลี่ยนไฟล์ใหม่"
              >
                เปลี่ยนไฟล์
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-[#8E8E93] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10 rounded-full transition-colors"
                title="ลบไฟล์"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-[16px] border-2 border-dashed p-4 text-center transition-all bg-white ${
            isDragging
              ? 'border-[#007AFF] bg-[#007AFF]/5'
              : 'border-[#C7C7CC] hover:border-[#007AFF] hover:bg-[#007AFF]/[0.02]'
          }`}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-9 h-9 rounded-full bg-[#767680]/10 text-[#007AFF] flex items-center justify-center">
              {isPhoto ? <Camera className="w-4 h-4" /> : <UploadCloud className="w-4 h-4" />}
            </div>
            <p className="text-xs font-semibold text-[#1C1C1E]">
              {isPhoto
                ? 'คลิกเพื่ออัปโหลดรูปถ่ายหน้าตรงชุดนิสิต หรือลากรูปมาวาง'
                : 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'}
            </p>
            <p className="text-[10px] text-[#8E8E93]">
              {isPhoto
                ? 'รองรับไฟล์ภาพ JPG, PNG (ขนาดไม่เกิน 5MB)'
                : 'รองรับไฟล์ PDF, JPG, PNG ขนาดไม่เกิน 10MB'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
