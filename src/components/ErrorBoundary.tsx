import React from "react";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error?: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: any) {
    // You could log to an error reporting service here
    console.error("Caught error in ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <pre className="whitespace-pre-wrap bg-gray-100 p-3 rounded text-sm">
            {String(this.state.error)}
          </pre>
          <p className="mt-2">Open the browser console for full details.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
