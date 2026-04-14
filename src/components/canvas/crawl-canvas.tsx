"use client";

import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useCallback } from "react";
import { RootNode } from "./nodes/root-node";
import { LinkNode } from "./nodes/link-node";
import { LoadingNode } from "./nodes/loading-node";
import { toGraph } from "@/lib/crawler/to-graph";
import { NodeDetailPanel } from "./node-detail-panel";
import { useCrawlStore } from "../store/crawl-store";
import { useTheme } from "next-themes";
import { CrawlFilters } from "../dashboard/crawl-filters";

const nodeTypes = {
  rootNode: RootNode,
  linkNode: LinkNode,
  loadingNode: LoadingNode,
};

type Props = {
  crawl: any;
  links: any[];
  isLoading?: boolean;
};

export function CrawlCanvas({ crawl, links, isLoading }: Props) {
  const { selectedNode, setSelectedNode } = useCrawlStore();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const { fitView } = useReactFlow();

  // Convert crawl data to React Flow nodes/edges
  // Re-runs every time new links come in (real time updates)
  useEffect(() => {
    if (!crawl) return;
    const { nodes: newNodes, edges: newEdges } = toGraph(crawl, links);
    setNodes(newNodes);
    setEdges(newEdges);

    // Fit view after nodes update
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
  }, [crawl, links]);

  const onNodeClick = useCallback((_: any, node: any) => {
    if (node.type === "rootNode") return;
    setSelectedNode(node.data);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        minZoom={0.05}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls
          className="bottom-4! left-4! shadow-lg! dark:text-black"
          showInteractive={false}
        />
        {/* <MiniMap
          className="bottom-4! right-4! shadow-lg!"
          nodeColor={(node) => {
            if (node.type === "rootNode") return "#1f2937";
            if (node.data?.isBroken) return "#ef4444";
            if (node.data?.isRedirect) return "#f59e0b";
            return "#22c55e";
          }}
          maskColor="rgba(0,0,0,0.05)"
        /> */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? "#3f3f46" : "#e5e7eb"}
        />
        <CrawlFilters className="flex md:hidden absolute top-2! right-2! z-100000" />
      </ReactFlow>

      {/* Node detail panel — slides in when node clicked */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-white rounded-full px-4 py-2 shadow-lg border flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Crawling...
          </div>
        </div>
      )}
    </div>
  );
}
