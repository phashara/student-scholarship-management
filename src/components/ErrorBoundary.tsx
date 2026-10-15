import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center p-4 font-['-apple-system','BlinkMacSystemFont','SF_Pro_Display','Prompt','Sarabun',sans-serif]">
          <div className="bg-white rounded-[24px] p-8 max-w-lg w-full text-center border border-black/[0.08] shadow-lg space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
                เกิดข้อผิดพลาดในการแสดงผล
              </h2>
              <p className="text-xs text-[#8E8E93] mt-2 leading-relaxed">
                ระบบพบข้อผิดพลาดชั่วคราวในการประมวลผลข้อมูล กรุณากดปุ่มด้านล่างเพื่อโหลดหน้านี้ใหม่อีกครั้ง
              </p>
              {this.state.error?.message && (
                <div className="mt-3 p-3 rounded-xl bg-neutral-50 text-[11px] text-neutral-600 text-left font-mono overflow-x-auto border border-black/[0.05]">
                  {this.state.error.message}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-[#007AFF] text-white text-xs font-bold shadow-md shadow-[#007AFF]/25 cursor-pointer hover:bg-[#0066CC] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>รีเฟรชหน้าเว็บ</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
