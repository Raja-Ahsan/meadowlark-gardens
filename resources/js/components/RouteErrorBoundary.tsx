import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = {
  children: ReactNode
}

type State = {
  error: Error | null
}

/**
 * Prevents a failed lazy chunk (common on flaky mobile networks / Safari) from
 * leaving the user on a permanent blank "Loading…" screen.
 */
export default class RouteErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Route render failed', error, info.componentStack)
  }

  private retry = () => {
    this.setState({ error: null })
    // Hard reload recovers from stale/failed dynamic imports after deploy.
    window.location.reload()
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 px-4 text-center">
          <p className="text-forest-800 font-sans font-600 text-sm">
            This page failed to load. Please try again.
          </p>
          <button
            type="button"
            onClick={this.retry}
            className="px-4 py-2.5 rounded-xl bg-forest-700 text-white text-sm font-sans font-600"
          >
            Reload page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
