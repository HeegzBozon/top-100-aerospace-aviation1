import React from 'react';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-amber-500">
          <AlertTriangle className="w-6 h-6" />
          <p className="text-sm font-medium text-slate-600">
            {this.props.label || 'This panel'} encountered an error
          </p>
          <button
            className="text-xs text-slate-400 underline hover:text-slate-600"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
