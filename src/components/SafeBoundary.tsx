// If a 3D layer throws (an unsupported GPU feature, a browser quirk), drop that layer quietly
// instead of taking the whole page down with it.
import { Component, type ReactNode } from 'react'
import { posthogLog } from '../posthog'

export class SafeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('3D layer disabled:', err)
    posthogLog.error('webgl layer disabled', {
      failure_boundary: 'safe_boundary',
      layer: '3d',
    })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
