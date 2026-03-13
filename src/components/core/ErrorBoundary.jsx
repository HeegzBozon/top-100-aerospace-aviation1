import React from 'react';
import { AlertCircle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
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
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}