import React from 'react';

// One editorial section meeting an unexpected record shape must cost the edition
// that section, never the page. Each section renders inside its own boundary, so
// a missing funding attribute, an empty honoree list, or any other parser fault
// stays local instead of blanking the whole publication behind the app's error
// boundary.
export default class PublicationSectionBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    console.error(`Publication section "${this.props.name || 'unknown'}" failed:`, error, info);
  }

  render() {
    if (this.state.failed) {
      // A quiet, designed note in place of the section — never a red fault box.
      return (
        <section className="py-10 md:py-16 px-4 md:px-12 lg:px-24" style={{ background: '#faf8f5' }}>
          <div className="max-w-6xl mx-auto">
            <p
              className="text-[9px] md:text-[10px] tracking-[0.3em] md:tracking-[0.5em] uppercase mb-2"
              style={{ color: '#4a90b8' }}
            >
              {this.props.label || 'This section'}
            </p>
            <p className="text-sm" style={{ color: '#1e3a5a' }}>
              This part of the edition is being re-assembled. The rest of the record stands.
            </p>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}