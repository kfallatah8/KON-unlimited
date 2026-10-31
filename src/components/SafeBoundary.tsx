// If a 3D layer throws (an unsupported GPU feature, a browser quirk), drop that layer quietly
// instead of taking the whole page down with it.
import { Component, type ReactNode } from 'react'

export class SafeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(err: unknown) {
    console.warn('3D layer disabled:', err)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
