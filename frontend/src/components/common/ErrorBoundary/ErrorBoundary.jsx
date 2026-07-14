import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--khmer-red, #dc2626)' }}>
            មានកំហុសកើតឡើង
          </h2>
          <p style={{ color: 'var(--gray-600, #6b7280)', marginBottom: '1.5rem', maxWidth: '400px' }}>
            សូមព្យាយាមម្តងទៀត ឬទាក់ទងក្រុមគាំទ្រ។
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--primary, #2563eb)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            ព្យាយាមម្តងទៀត
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
