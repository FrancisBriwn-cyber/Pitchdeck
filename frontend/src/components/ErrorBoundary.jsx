import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(err) {
    return { hasError: true, message: err?.message || '' };
  }

  componentDidCatch(err, info) {
    console.error('ErrorBoundary caught:', err, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '2rem', textAlign: 'center', background: 'var(--surface)',
      }}>
        <div style={{ marginBottom: '1.5rem', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
          Pitch<span style={{ color: 'var(--green)' }}>Deck</span>
        </div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Something went wrong
        </h1>
        <p style={{ color: 'var(--ink-muted)', maxWidth: '380px', marginBottom: '2rem', lineHeight: 1.6 }}>
          An unexpected error occurred. Your data is safe — this is just a display glitch.
        </p>
        {this.state.message && (
          <code style={{
            display: 'block', background: '#f1f5f9', borderRadius: '8px',
            padding: '0.6rem 1rem', fontSize: '0.78rem', color: '#64748b',
            maxWidth: '420px', marginBottom: '2rem', wordBreak: 'break-word',
          }}>
            {this.state.message}
          </code>
        )}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            className="btn btn-primary"
            onClick={() => this.setState({ hasError: false, message: '' })}
          >
            Try again
          </button>
          <a href="/" className="btn btn-outline">
            Go to homepage
          </a>
        </div>
      </div>
    );
  }
}
