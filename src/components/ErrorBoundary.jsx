import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white p-8 font-mono">
          <h1 className="text-red-500 text-2xl mb-4">CRITICAL SYSTEM FAILURE</h1>
          <p className="mb-4">The simulation encountered an unrecoverable error.</p>
          <div className="bg-gray-900 p-4 rounded overflow-auto mb-4 border border-gray-800">
            <p className="text-red-400 font-bold">{this.state.error && this.state.error.toString()}</p>
            <pre className="text-xs text-gray-500 mt-2">
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-white text-black font-bold rounded hover:bg-gray-200"
          >
            REBOOT SYSTEM
          </button>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
