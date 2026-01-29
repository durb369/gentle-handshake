import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
};

export class AppErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // Keep this for debugging; we still render a friendly UI.
    // eslint-disable-next-line no-console
    console.error("App crashed:", error);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-background text-foreground">
        <main className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-xl rounded-xl border bg-card p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-destructive/10 p-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-semibold">Something went wrong</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  The app hit an unexpected error. Reload the page and try again.
                </p>
                <div className="mt-4">
                  <Button onClick={this.handleReload}>Reload</Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
