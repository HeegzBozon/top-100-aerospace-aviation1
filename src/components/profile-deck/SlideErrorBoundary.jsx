import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';
import { B } from '@/components/fellow-home/fellowHomeConfig';

// Per-slide error boundary. A throw in one slide no longer takes down the
// whole profile (the root boundary would replace the entire app with a
// generic "Section failed to load"). This renders a branded, labeled
// fallback showing the slide name and the actual error so the root cause
// is visible, and offers a retry that resets the boundary.
export default class SlideErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`Slide "${this.props.label}" failed:`, error, info);
  }

  retry = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      return (
        <section className="relative min-h-screen flex items-center justify-center" style={{ background: B.cream }}>
          <div className="text-center px-6 max-w-md">
            <div className="mx-auto mb-5 w-12 h-12 rounded-full flex items-center justify-center" style={{ background: `${B.gold}15`, border: `1px solid ${B.gold}33` }}>
              <AlertCircle className="w-5 h-5" style={{ color: B.gold }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: B.muted }}>
              {this.props.label} slide
            </p>
            <h2 className="text-2xl font-bold mb-2" style={{ color: B.navy, fontFamily: "'Playfair Display', Georgia, serif" }}>
              This section couldn't render
            </h2>
            <p className="text-xs mb-5 break-words" style={{ color: B.muted }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
            <button
              onClick={this.retry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-[0.14em]"
              style={{ background: B.navy, color: B.cream }}
            >
              <RotateCw className="w-3.5 h-3.5" /> Try again
            </button>
          </div>
        </section>
      );
    }
    return this.props.children;
  }
}