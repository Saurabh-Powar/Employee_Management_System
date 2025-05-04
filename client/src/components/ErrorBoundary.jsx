"use client"

import { Component } from "react"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo,
    })
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>
            We're sorry for the inconvenience. Please try refreshing the page or contact support if the problem
            persists.
          </p>
          <button onClick={() => window.location.reload()} className="error-reload-btn">
            Refresh Page
          </button>
          {this.props.showDetails && (
            <details style={{ whiteSpace: "pre-wrap", marginTop: "20px" }}>
              <summary>Error Details</summary>
              <p>{this.state.error && this.state.error.toString()}</p>
              <p>Component Stack:</p>
              <pre>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
            </details>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
