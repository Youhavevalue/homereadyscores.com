import { Component } from 'react';

export default class RouteLoadBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <section role="alert" aria-labelledby="route-load-title" className="mx-auto max-w-2xl px-6 py-16 text-navy">
        <img src="/brand/c05/logos/logo-horizontal-primary.svg" alt="HomeReady Scores" width="216" height="66" className="mb-6 max-w-full h-auto" />
        <h1 id="route-load-title" className="mb-4 text-3xl">This page could not finish loading</h1>
        <p className="mb-6">Check your connection, then reload this page. Unsaved details may need to be entered again.</p>
        <button type="button" className="auth-button" onClick={() => window.location.reload()}>Reload page</button>
        <a className="mt-6 inline-block underline" href="/">Return home</a>
      </section>
    );
  }
}
