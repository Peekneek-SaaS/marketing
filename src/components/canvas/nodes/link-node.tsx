"use client";

import { Handle, Position } from "@xyflow/react";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  ExternalLink,
  Loader,
} from "lucide-react";

type LinkNodeData = {
  url: string;
  parentUrl: string | null;
  status: number | null;
  redirectedTo: string | null;
  responseTime: number | null;
  error: string | null;
  isBroken: boolean;
  isRedirect: boolean;
  isExternal: boolean;
  depth: number;
  /** Show bottom source handle only when this URL has crawled child links */
  hasChildren: boolean;
};

export function LinkNode({ data }: { data: LinkNodeData }) {
  const isChecking = data.status === null && !data.error;

  const pathname = (() => {
    try {
      const parsed = new URL(data.url);
      return parsed.pathname || "/";
    } catch {
      return data.url;
    }
  })();

  const getStatusIcon = () => {
    if (isChecking)
      return <Loader className="w-3 h-3 text-gray-400 animate-spin" />;
    if (data.isBroken) return <XCircle className="w-3 h-3 text-red-500" />;
    if (data.isRedirect)
      return <ArrowRight className="w-3 h-3 text-yellow-500" />;
    return <CheckCircle className="w-3 h-3 text-green-500" />;
  };

  const getBorderColor = () => {
    if (isChecking) return "border-gray-200";
    if (data.isBroken) return "border-red-200 bg-red-50";
    if (data.isRedirect) return "border-yellow-200 bg-yellow-50";
    return "border-green-200 bg-green-50";
  };

  const getStatusText = () => {
    if (isChecking) return "Checking...";
    if (data.error) return data.error;
    if (data.isBroken) return `${data.status} Not Found`;
    if (data.isRedirect)
      return `${data.status} → ${data.redirectedTo ? new URL(data.redirectedTo).pathname : ""}`;
    return `${data.status} OK`;
  };

  return (
    <div
      className={`
      relative
      bg-white border rounded-lg shadow-sm p-3
      min-w-[200px] max-w-[280px]
      ${getBorderColor()}
      hover:shadow-md transition-shadow cursor-pointer
    `}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white"
      />

      {/* URL */}
      <div className="flex items-center gap-2 mb-1">
        {getStatusIcon()}
        <span className="text-xs font-medium text-gray-800 truncate max-w-[200px]">
          {pathname}
        </span>
        {data.isExternal && (
          <ExternalLink className="w-3 h-3 text-gray-400 ml-auto flex-shrink-0" />
        )}
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <span
          className={`text-[10px] ${
            data.isBroken
              ? "text-red-500"
              : data.isRedirect
                ? "text-yellow-600"
                : "text-green-600"
          }`}
        >
          {getStatusText()}
        </span>

        {data.responseTime && (
          <span className="text-[10px] text-gray-400">
            {data.responseTime}ms
          </span>
        )}
      </div>

      {data.hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          className="!bg-gray-400 !w-2 !h-2 !border-2 !border-white"
        />
      )}
    </div>
  );
}
