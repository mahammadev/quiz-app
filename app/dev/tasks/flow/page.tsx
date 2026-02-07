'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  type Node,
  type Edge,
  type Connection,
  applyNodeChanges,
  applyEdgeChanges,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Save, ArrowLeft, Plus, Trash2, Loader2, Settings2, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/components/ui/base-toaster';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const NODE_TYPES = [
  { label: 'Default', value: 'default' },
  { label: 'Input (Start)', value: 'input' },
  { label: 'Output (End)', value: 'output' },
];

const COLORS = [
  { label: 'Default', class: '' },
  { label: 'Primary (Purple)', class: 'bg-primary text-primary-foreground border-primary' },
  { label: 'Muted (Gray)', class: 'bg-muted border-dashed text-muted-foreground' },
  { label: 'Blue (Setup)', class: 'bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-300' },
  { label: 'Amber (Process)', class: 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-300' },
  { label: 'Green (Complete)', class: 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-300' },
  { label: 'Red (Error/Danger)', class: 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-300' },
];

export default function FlowEditorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);

  useEffect(() => {
    fetch('/api/dev/flow')
      .then((res) => res.json())
      .then((data) => {
        if (data.nodes && data.nodes.length > 0) setNodes(data.nodes);
        if (data.edges) setEdges(data.edges);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load flow:', err);
        setLoading(false);
      });
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  );

  const onNodeClick = (_: any, node: Node) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  };

  const onEdgeClick = (_: any, edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  };

  const onPaneClick = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const updateNodeData = (id: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...newData } };
        }
        return node;
      })
    );
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...newData } } : null);
    }
  };

  const updateNodeStyle = (id: string, className: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, className: `p-3 rounded-md border-2 ${className}` };
        }
        return node;
      })
    );
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => prev ? { ...prev, className: `p-3 rounded-md border-2 ${className}` } : null);
    }
  };

  const updateNodeType = (id: string, type: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, type };
        }
        return node;
      })
    );
    if (selectedNode?.id === id) {
      setSelectedNode((prev) => prev ? { ...prev, type } : null);
    }
  };

  const updateEdgeData = (id: string, label: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return { ...edge, label };
        }
        return edge;
      })
    );
    if (selectedEdge?.id === id) {
      setSelectedEdge((prev) => prev ? { ...prev, label } : null);
    }
  };

  const toggleEdgeAnimation = (id: string) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === id) {
          return { ...edge, animated: !edge.animated };
        }
        return edge;
      })
    );
    if (selectedEdge?.id === id) {
      setSelectedEdge((prev) => prev ? { ...prev, animated: !prev.animated } : null);
    }
  };

  const deleteSelected = () => {
    if (selectedNode) {
      setNodes((nds) => nds.filter((n) => n.id !== selectedNode.id));
      setEdges((eds) => eds.filter((e) => e.source !== selectedNode.id && e.target !== selectedNode.id));
      setSelectedNode(null);
    } else if (selectedEdge) {
      setEdges((eds) => eds.filter((e) => e.id !== selectedEdge.id));
      setSelectedEdge(null);
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/dev/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges }),
      });
      toast.success('Flow saved and agent notified via Task Ledger!');
    } catch (err) {
      console.error('Failed to save flow:', err);
      toast.error('Failed to save flow');
    } finally {
      setSaving(false);
    }
  };

  const onAddNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      data: { label: 'New Block' },
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      className: 'p-3 rounded-md border-2 bg-card text-card-foreground shadow-sm'
    };
    setNodes((nds) => nds.concat(newNode));
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading Flow...</div>;

  return (
    <div className="h-screen w-screen flex flex-col bg-background">
      <header className="h-16 border-b flex items-center justify-between px-6 bg-card shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/dev/tasks">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Ledger
            </Button>
          </Link>
          <Separator orientation="vertical" className="h-6" />
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
             <Settings2 className="w-5 h-5" />
             User Flow Editor
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onAddNode} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Block
          </Button>
          <Button size="sm" onClick={onSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Flow
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onPaneClick={onPaneClick}
            fitView
            colorMode="system"
          >
            <Background />
            <Controls />
            <MiniMap />
            <Panel position="bottom-right" className="bg-muted p-2 rounded-md border text-xs text-muted-foreground">
              Select elements to edit • Delete key to remove
            </Panel>
          </ReactFlow>
        </div>

        {/* Edit Sidebar */}
        {(selectedNode || selectedEdge) && (
          <aside className="w-80 border-l bg-card flex flex-col overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b flex items-center justify-between bg-muted/30">
              <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                {selectedNode ? 'Edit Block' : 'Edit Connection'}
              </h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPaneClick}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              {selectedNode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="node-label">Label</Label>
                    <Textarea
                      id="node-label"
                      value={selectedNode.data.label as string}
                      onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                      className="min-h-[80px] resize-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={selectedNode.type || 'default'} 
                      onValueChange={(val) => updateNodeType(selectedNode.id, val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {NODE_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Color Style</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {COLORS.map((c) => (
                        <Button
                          key={c.label}
                          variant="outline"
                          size="sm"
                          className={`justify-start font-normal text-xs h-auto py-2 ${c.class}`}
                          onClick={() => updateNodeStyle(selectedNode.id, c.class)}
                        >
                          {c.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {selectedEdge && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="edge-label">Label (Optional)</Label>
                    <Input
                      id="edge-label"
                      value={(selectedEdge.label as string) || ''}
                      onChange={(e) => updateEdgeData(selectedEdge.id, e.target.value)}
                      placeholder="e.g. Success, Clicked, Guest"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/10">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Animated</Label>
                      <p className="text-[10px] text-muted-foreground">Moving dash effect</p>
                    </div>
                    <Button 
                      variant={selectedEdge.animated ? "default" : "outline"} 
                      size="sm" 
                      onClick={() => toggleEdgeAnimation(selectedEdge.id)}
                    >
                      {selectedEdge.animated ? 'On' : 'Off'}
                    </Button>
                  </div>
                </>
              )}

              <Separator />

              <Button 
                variant="destructive" 
                className="w-full gap-2" 
                onClick={deleteSelected}
              >
                <Trash2 className="w-4 h-4" />
                Delete Element
              </Button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
