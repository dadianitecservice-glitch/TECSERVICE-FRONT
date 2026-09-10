import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  window.addEventListener('resize', onChange)
  return () => window.removeEventListener('resize', onChange)
}
const getSnapshot = () => window.innerWidth
// Match build-time HTML during hydration, then immediately adopt the real viewport.
const getServerSnapshot = () => 1440

export function useViewportWidth() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
