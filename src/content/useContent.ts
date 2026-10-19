import { useStore } from '../state/store'
import { content } from './site'

export const useContent = () => content[useStore((s) => s.lang)]
