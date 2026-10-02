import React from "react";

export class RecoveryBoundary extends React.Component<
  React.PropsWithChildren<{ label: string }>,
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <section className="tp-card" role="alert">
          <h2>{this.props.label} is temporarily unavailable</h2>
          <p>Please reload to try again. Other race cards remain available.</p>
          <button onClick={() => window.location.reload()}>Reload app</button>
        </section>
      );
    return this.props.children;
  }
}
