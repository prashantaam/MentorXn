import { Component } from "react";

/*
 * Catches render errors in its children and shows `fallback(error)`
 * instead of crashing the whole page. Give it a `key` that changes
 * when the input changes, so it retries after a fix.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return this.props.fallback
        ? this.props.fallback(this.state.error)
        : null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
