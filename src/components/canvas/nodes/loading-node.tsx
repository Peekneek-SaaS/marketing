'use client'

import { Handle, Position } from '@xyflow/react'
import { Loader } from 'lucide-react'

export function LoadingNode({ data }: { data: { url: string } }) {
  const pathname = (() => {
    try { return new URL(data.url).pathname || '/' } catch { return data.url }
  })()

  return (
    <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm p-3 min-w-[200px] opacity-60">
      <Handle type="target" position={Position.Top} id="top" />
      <div className="flex items-center gap-2">
        <Loader className="w-3 h-3 text-gray-400 animate-spin" />
        <span className="text-xs text-gray-500 truncate">{pathname}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="bottom" />
    </div>
  )
}