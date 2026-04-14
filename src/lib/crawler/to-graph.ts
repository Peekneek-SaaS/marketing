import type { Node, Edge } from "@xyflow/react";

type LinkData = {
  id: string;
  url: string;
  parentUrl: string | null;
  status: number | null;
  redirectedTo: string | null;
  responseTime: number | null;
  error: string | null;
  isBroken: boolean;
  isRedirect: boolean;
  isExternal: boolean;
};

type CrawlData = {
  id: string;
  url: string;
  totalLinks: number;
  brokenLinks: number;
  workingLinks: number;
  redirectLinks: number;
  durationMs: number | null;
  status: string;
};

// Top-to-bottom tree: depth → y, sibling index → x (centered per row)
function calculatePosition(
  depth: number,
  index: number,
  totalAtDepth: number,
): { x: number; y: number } {
  const LEVEL_GAP = 180; // vertical space between tree levels (top → bottom)
  const SIBLING_GAP = 280; // horizontal space between siblings on the same row

  const y = depth * LEVEL_GAP;

  // Center siblings horizontally at each depth
  const totalWidth = (totalAtDepth - 1) * SIBLING_GAP;
  const startX = -totalWidth / 2;
  const x = startX + index * SIBLING_GAP;

  return { x, y };
}

export function toGraph(
  crawl: CrawlData,
  links: LinkData[],
): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Map: parentUrl → children links
  const childrenMap = new Map<string, LinkData[]>();

  for (const link of links) {
    const parent = link.parentUrl || crawl.url;
    if (!childrenMap.has(parent)) {
      childrenMap.set(parent, []);
    }
    childrenMap.get(parent)!.push(link);
  }

  const rootHasChildren = (childrenMap.get(crawl.url)?.length ?? 0) > 0;

  nodes.push({
    id: "root",
    type: "rootNode",
    position: { x: 0, y: 0 },
    data: {
      url: crawl.url,
      totalLinks: crawl.totalLinks,
      brokenLinks: crawl.brokenLinks,
      workingLinks: crawl.workingLinks,
      redirectLinks: crawl.redirectLinks,
      durationMs: crawl.durationMs,
      status: crawl.status,
      hasChildren: rootHasChildren,
    },
  });

  // ============================================
  // BFS to assign depths and positions
  // ============================================
  type QueueItem = {
    url: string;
    nodeId: string;
    depth: number;
  };

  const queue: QueueItem[] = [
    {
      url: crawl.url,
      nodeId: "root",
      depth: 0,
    },
  ];

  const visited = new Set<string>([crawl.url]);

  // Track how many nodes at each depth for positioning
  const depthCount = new Map<number, number>();
  const depthIndex = new Map<number, number>();

  // First pass — count nodes at each depth
  function countDepths(url: string, depth: number) {
    const children = childrenMap.get(url) || [];
    depthCount.set(
      depth + 1,
      (depthCount.get(depth + 1) || 0) + children.length,
    );
    for (const child of children) {
      if (!visited.has(child.url)) {
        visited.add(child.url);
        countDepths(child.url, depth + 1);
      }
    }
  }
  countDepths(crawl.url, 0);
  visited.clear();
  visited.add(crawl.url);

  // Second pass — create nodes + edges
  while (queue.length > 0) {
    const { url, nodeId, depth } = queue.shift()!;

    const children = childrenMap.get(url) || [];

    for (const child of children) {
      if (visited.has(child.url)) continue;
      visited.add(child.url);

      const childNodeId = `node-${child.id}`;
      const total = depthCount.get(depth + 1) || 1;
      const index = depthIndex.get(depth + 1) || 0;
      depthIndex.set(depth + 1, index + 1);

      const position = calculatePosition(depth + 1, index, total);

      const hasChildren = (childrenMap.get(child.url)?.length ?? 0) > 0;

      // Create node
      nodes.push({
        id: childNodeId,
        type: "linkNode",
        position,
        data: {
          url: child.url,
          parentUrl: child.parentUrl,
          status: child.status,
          redirectedTo: child.redirectedTo,
          responseTime: child.responseTime,
          error: child.error,
          isBroken: child.isBroken,
          isRedirect: child.isRedirect,
          isExternal: child.isExternal,
          depth: depth + 1,
          hasChildren,
        },
      });

      // Create edge from parent to child (top/bottom handles)
      edges.push({
        id: `edge-${nodeId}-${childNodeId}`,
        source: nodeId,
        target: childNodeId,
        sourceHandle: "bottom",
        targetHandle: "top",
        type: "smoothstep",
        animated: false,
        style: {
          stroke: child.isBroken
            ? "#ef4444" // red for broken
            : child.isRedirect
              ? "#f59e0b" // yellow for redirect
              : "#22c55e", // green for working
          strokeWidth: 2,
        },
      });

      // Add to queue for processing children
      queue.push({
        url: child.url,
        nodeId: childNodeId,
        depth: depth + 1,
      });
    }
  }

  return { nodes, edges };
}
