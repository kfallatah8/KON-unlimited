// If a 3D layer throws (an unsupported GPU feature, a browser quirk), drop that layer quietly
// instead of taking the whole page down with it.
import { Component, type ReactNode } from 'react'
import { posthogLogger } from '../lib/posthog'

export class SafeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('3D layer disabled:', err)
    posthogLogger.warn('webgl_layer_disabled', {
      event: 'webgl_layer_disabled',
      layer: '3d',
    })
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
