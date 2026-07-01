import React, { Component, ErrorInfo } from "react";
import { Heart } from "lucide-react";

interface Props { children: React.ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "linear-gradient(180deg, #0C0A09 0%, #1C1917 100%)" }}>
          <div className="text-center max-w-md">
            <div className="w-20 h-20 rounded-[22px] glass-obsidian mx-auto mb-6 flex items-center justify-center">
              <Heart size={28} className="text-[#C97B7B]" />
            </div>
            <div className="wedding-label mb-3">Something went wrong</div>
            <h1 className="display text-[40px] text-[#FAF7F2] mb-4">Unexpected Error</h1>
            <p className="text-[14px] text-[#78716C] leading-relaxed mb-8">
              We hit a snag. Please refresh the page to continue your wedding journey.
            </p>
            {this.state.error && (
              <div className="glass-obsidian rounded-[16px] p-4 mb-6 text-left">
                <code className="text-[12px] text-[#C97B7B] font-mono break-all">
                  {this.state.error.message}
                </code>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="fv-btn-primary"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
