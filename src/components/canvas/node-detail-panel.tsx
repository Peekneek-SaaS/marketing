"use client";

import {
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";

type Props = {
  node: any;
  onClose: () => void;
};

export function NodeDetailPanel({ node, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(node.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    if (node.isBroken) return "text-red-500 bg-red-50";
    if (node.isRedirect) return "text-yellow-600 bg-yellow-50";
    return "text-green-600 bg-green-50";
  };

  const getStatusLabel = () => {
    if (node.isBroken) return `${node.status || "Error"} — Broken`;
    if (node.isRedirect) return `${node.status} — Redirect`;
    return `${node.status} — OK`;
  };

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-10 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <span className="font-semibold text-gray-900 text-sm">
          Link Details
        </span>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Status badge */}
        <div
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor()}`}
        >
          {node.isBroken ? (
            <XCircle className="w-3 h-3" />
          ) : node.isRedirect ? (
            <ArrowRight className="w-3 h-3" />
          ) : (
            <CheckCircle className="w-3 h-3" />
          )}
          {getStatusLabel()}
        </div>

        {/* URL */}
        <div>
          <p className="text-xs text-gray-400 mb-1">URL</p>
          <p className="text-sm text-gray-800 break-all font-mono bg-gray-50 rounded p-2">
            {node.url}
          </p>
        </div>

        {/* Parent URL */}
        {node.parentUrl && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Found on</p>
            <p className="text-sm text-gray-600 break-all font-mono bg-gray-50 rounded p-2">
              {node.parentUrl}
            </p>
          </div>
        )}

        {/* Redirect target */}
        {node.redirectedTo && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Redirects to</p>
            <p className="text-sm text-gray-600 break-all font-mono bg-gray-50 rounded p-2">
              {node.redirectedTo}
            </p>
          </div>
        )}

        {/* Response time */}
        {node.responseTime && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Response time</p>
            <p className="text-sm text-gray-700">{node.responseTime}ms</p>
          </div>
        )}

        {/* Error */}
        {node.error && (
          <div>
            <p className="text-xs text-gray-400 mb-1">Error</p>
            <p className="text-sm text-red-600">{node.error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={copyUrl}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg py-2 transition-colors"
          >
            <Copy className="w-3 h-3" />
            {copied ? "Copied!" : "Copy URL"}
          </button>
          <a
            href={node.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-gray-900 hover:bg-gray-800 text-white rounded-lg py-2 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Open link
          </a>
        </div>
      </div>
    </div>
  );
}
