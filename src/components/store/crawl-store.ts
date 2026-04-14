import { create } from 'zustand'

type SelectedNode = {
  url: string
  parentUrl: string | null
  status: number | null
  redirectedTo: string | null
  responseTime: number | null
  error: string | null
  isBroken: boolean
  isRedirect: boolean
  isExternal: boolean
} | null

type Filter = 'all' | 'broken' | 'working' | 'redirects' | 'external'

type CrawlStore = {
  selectedNode: SelectedNode
  setSelectedNode: (node: SelectedNode) => void
  filter: Filter
  setFilter: (filter: Filter) => void
}

export const useCrawlStore = create<CrawlStore>((set) => ({
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  filter: 'all',
  setFilter: (filter) => set({ filter }),
}))