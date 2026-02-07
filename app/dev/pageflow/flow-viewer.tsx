"use client";

import { ReactFlow, Background, Controls, MiniMap, Node, Edge, useNodesState, useEdgesState, Panel, useReactFlow, Position } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useEffect, useState, useCallback } from 'react';
import PagePreviewNode from './page-preview-node';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import dagre from 'dagre';
import { Button } from '@/components/ui/button';
import { Layout } from 'lucide-react';

interface FlowViewerProps {
  initialNodes: Node[];
  initialEdges: Edge[];
}

const nodeTypes = {
  pagePreview: PagePreviewNode,
};

const routeMap: Record<string, string> = {
  "landing page": "/dev/previews/landing",
  "student view": "/dev/previews/dashboard",
  "student dashboard (non org)": "/dev/previews/dashboard",
  "Org Admin Dashboard": "/dev/previews/org-admin", 
  "Teacher Dashboard": "/dev/previews/org-teacher",
  "Org Student Dashboard": "/dev/previews/org-student",
  "my quizes": "/dev/previews/dashboard", 
  "Create Questions": "/dev/previews/dashboard", 
  "Mistakes": "/dev/previews/dashboard",
};

const getLayoutedElements = (nodes: Node[], edges: Edge[], showPreview: boolean) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  // Increase separation for larger nodes in preview mode
  const rankSep = showPreview ? 200 : 80;
  const nodeSep = showPreview ? 100 : 50;

  dagreGraph.setGraph({ rankdir: 'TB', ranksep: rankSep, nodesep: nodeSep });

  nodes.forEach((node) => {
    // Determine size based on type or style
    let width = 150;
    let height = 40;

    if (showPreview && node.type === 'pagePreview') {
        width = 400;
        height = 300;
    } else if (node.measured?.width && node.measured?.height) {
        width = node.measured.width;
        height = node.measured.height;
    }

    dagreGraph.setNode(node.id, { width, height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      // We are shifting the dagre node position (center-based) to top-left
      // so it matches React Flow's coordinate system
      position: {
        x: nodeWithPosition.x - (dagreGraph.node(node.id).width / 2),
        y: nodeWithPosition.y - (dagreGraph.node(node.id).height / 2),
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

function FlowViewerContent({ initialNodes, initialEdges }: FlowViewerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [showPreview, setShowPreview] = useState(false);
  const { fitView } = useReactFlow();

  const transformNodes = useCallback((baseNodes: Node[], isPreview: boolean) => {
    return baseNodes.map((node) => {
      const label = (node.data.label as string) || "";
      let matchedRoute = routeMap[label];
      
      if (!matchedRoute) {
        const lowerLabel = label.toLowerCase();
        for (const [key, route] of Object.entries(routeMap)) {
             if (lowerLabel.includes(key.toLowerCase())) {
                 matchedRoute = route;
                 break;
             }
        }
      }

      if (isPreview && matchedRoute) {
        return {
          ...node,
          type: 'pagePreview',
          data: {
            ...node.data,
            route: matchedRoute,
          },
          style: { width: 400, height: 300 }
        };
      } else {
        return {
          ...node,
          type: node.type || 'default',
          style: undefined
        };
      }
    });
  }, []);

  const onLayout = useCallback(() => {
    // First apply transformation to get correct sizes/types
    const currentTransformedNodes = transformNodes(initialNodes, showPreview);
    
    // Then calculate layout
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      currentTransformedNodes,
      edges,
      showPreview
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
    
    window.requestAnimationFrame(() => {
      fitView({ padding: 0.2, duration: 800 });
    });
  }, [initialNodes, edges, showPreview, setNodes, setEdges, fitView, transformNodes]);

  // Effect to update nodes when toggle changes, AND trigger layout automatically
  useEffect(() => {
    // 1. Transform nodes based on preview mode
    const transformed = transformNodes(initialNodes, showPreview);
    
    // 2. If preview is ON, auto-arrange immediately
    if (showPreview) {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            transformed,
            initialEdges,
            true
        );
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        // Defer fitView to allow rendering
        setTimeout(() => fitView({ padding: 0.2, duration: 800 }), 100);
    } else {
        // If preview is OFF, just show transformed nodes (revert to original positions if possible, 
        // or keep current positions? The prompt implies "auto arrange ... on show page previews".
        // If we switch back, we might want original positions or re-layout.
        // Let's reset to initialNodes' positions to be safe, or just transform them back.
        // If we use initialNodes positions, we lose manual drags, but that's expected for "auto arrange".
        // Let's stick to restoring the transformed nodes which inherit initial positions.
        setNodes(transformed);
    }
    
    setEdges(initialEdges);
  }, [showPreview, initialNodes, initialEdges, setNodes, setEdges, fitView, transformNodes]);

  return (
    <div className="h-full w-full border rounded-lg overflow-hidden bg-background relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        minZoom={0.1}
      >
        <Background />
        <Controls />
        <MiniMap />
        <Panel position="top-right" className="bg-card p-4 rounded-lg border shadow-sm flex flex-col gap-4 items-end">
           <div className="flex items-center gap-2">
               <Label htmlFor="preview-mode">Show Page Previews</Label>
               <Switch id="preview-mode" checked={showPreview} onCheckedChange={setShowPreview} />
           </div>
           {/* Manual Trigger if needed */}
           <Button variant="outline" size="sm" onClick={onLayout} className="gap-2">
               <Layout className="w-4 h-4" />
               Auto Arrange
           </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Wrapper to provide ReactFlowProvider context which uses useReactFlow
import { ReactFlowProvider } from '@xyflow/react';

export default function FlowViewer(props: FlowViewerProps) {
  return (
    <ReactFlowProvider>
      <FlowViewerContent {...props} />
    </ReactFlowProvider>
  );
}
