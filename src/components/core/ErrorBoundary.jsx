import React from 'react';
import { AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, detail: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, detail: error?.message ? String(error.message) : '' };
  }

  componentDidCatch(error, info) {
    console.error('Section error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="px-4 py-8 max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-900">Section failed to load</p>
              <p className="text-xs text-red-700 mt-1">Please refresh the page or try again later.</p>
              {/* The failing message, kept quiet, so a fault can be named instead of guessed at. */}
              {this.state.detail && (
                <p className="mt-2 text-[10px] font-mono text-red-700/80 break-words">{this.state.detail}</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}