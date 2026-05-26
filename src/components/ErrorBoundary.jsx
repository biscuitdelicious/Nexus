import React from 'react';

/**
 * Catches React render errors anywhere in the tree below.
 * Shows a fallback UI with the error and a Reset button
 * instead of letting the whole app go blank.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 *
 * Or per-page:
 *   <ErrorBoundary scope="Dashboard">
 *     <Dashboard />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Log full stack to console for debugging
    // eslint-disable-next-line no-console
    console.error(
      `[ErrorBoundary${this.props.scope ? ' / ' + this.props.scope : ''}]`,
      error,
      info
    );
    this.setState({ info });
  }

  reset = () => {
    this.setState({ error: null, info: null });
  };

  hardReload = () => {
    try { sessionStorage.removeItem('nexus_user'); } catch {}
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    const errMsg = this.state.error?.message || String(this.state.error);
    const errStack = (this.state.error?.stack || '').split('\n').slice(0, 6).join('\n');

    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#0d0d0d',
          color: '#eaeaea',
          fontFamily: '"Roboto Mono", "Courier New", monospace',
          padding: '32px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          style={{
            maxWidth: 720,
            width: '100%',
            border: '1px solid #FF003C',
            background: '#141414',
            padding: '24px'
          }}
        >
          <div
            style={{
              color: '#FF003C',
              fontSize: '0.7rem',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              marginBottom: 8
            }}
          >
            {`>_ APPLICATION ERROR${this.props.scope ? ' / ' + this.props.scope : ''}`}
          </div>

          <div
            style={{
              color: '#FFF',
              fontSize: '1rem',
              marginBottom: 16,
              wordBreak: 'break-word'
            }}
          >
            {errMsg}
          </div>

          <pre
            style={{
              color: '#888',
              fontSize: '0.7rem',
              background: '#0a0a0a',
              border: '1px solid #2a2a2a',
              padding: 12,
              overflow: 'auto',
              maxHeight: 200,
              margin: 0
            }}
          >
{errStack}
          </pre>

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button
              onClick={this.reset}
              style={{
                background: '#D4FF00',
                color: '#000',
                border: 'none',
                padding: '10px 20px',
                fontFamily: 'inherit',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                cursor: 'pointer'
              }}
            >
              {'>_ TRY AGAIN'}
            </button>

            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'transparent',
                color: '#888',
                border: '1px solid #2a2a2a',
                padding: '10px 20px',
                fontFamily: 'inherit',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                cursor: 'pointer'
              }}
            >
              RELOAD
            </button>

            <button
              onClick={this.hardReload}
              style={{
                background: 'transparent',
                color: '#FF003C',
                border: '1px solid #FF003C',
                padding: '10px 20px',
                fontFamily: 'inherit',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                cursor: 'pointer'
              }}
            >
              LOGOUT + RESET
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
