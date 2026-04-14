'use client'

import { Handle, Position } from '@xyflow/react'
import { Globe, CheckCircle, XCircle, Clock } from 'lucide-react'

type RootNodeData = {
  url: string
  totalLinks: number
  brokenLinks: number
  workingLinks: number
  redirectLinks: number
  durationMs: number | null
  status: string
  /** Outgoing edges only when there are child link nodes */
  hasChildren: boolean
}

export function RootNode({ data }: { data: RootNodeData }) {
  const hostname = (() => {
    try { return new URL(data.url).hostname } catch { return data.url }
  })()

  const isRunning = data.status === 'running'
  const duration = data.durationMs
    ? `${(data.durationMs / 1000).toFixed(1)}s`
    : null

  return (
    <div className="relative bg-white border-2 border-gray-800 rounded-xl shadow-lg p-4 min-w-[220px]">

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-4 h-4 text-gray-600" />
        <span className="font-semibold text-gray-900 text-sm truncate max-w-[160px]">
          {hostname}
        </span>
        {isRunning && (
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto" />
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircle className="w-3 h-3" />
          <span className="font-medium">{data.workingLinks}</span>
        </div>
        <div className="flex items-center gap-1 text-red-500">
          <XCircle className="w-3 h-3" />
          <span className="font-medium">{data.brokenLinks}</span>
        </div>
        {duration && (
          <div className="flex items-center gap-1 text-gray-400 ml-auto">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        )}
      </div>

      {data.hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!bg-gray-800 !w-3 !h-3 !border-2 !border-white"
        />
      )}
    </div>
  )
}