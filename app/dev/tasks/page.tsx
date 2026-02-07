'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Send, 
  User, 
  Bot, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  FileCode,
  Layout,
  MessageSquare,
  FileText,
  ExternalLink,
  Loader2,
  Waypoints,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import useSWR, { mutate } from 'swr';

interface TaskHistory {
  role: 'user' | 'agent';
  content: string;
  time: string;
}

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  history: TaskHistory[];
  affected_files?: string[];
}

interface TaskLedger {
  project_context: string;
  tasks: Task[];
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function DevTasksPage() {
  const { data: ledger, error } = useSWR<TaskLedger>('/api/dev/tasks', fetcher, {
    refreshInterval: 3000, // Poll every 3 seconds
    revalidateOnFocus: true,
  });

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // File Preview State
  const [previewFile, setPreviewFile] = useState<{ path: string; content: string } | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const lastHistoryLengthRef = useRef<number>(0);

  useEffect(() => {
    if (ledger && ledger.tasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(ledger.tasks[0].id);
    }
  }, [ledger, selectedTaskId]);

  useEffect(() => {
    const selectedTask = ledger?.tasks.find(t => t.id === selectedTaskId);
    const currentHistoryLength = selectedTask?.history.length || 0;
    
    if (currentHistoryLength > lastHistoryLengthRef.current || !lastHistoryLengthRef.current) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    lastHistoryLengthRef.current = currentHistoryLength;
  }, [selectedTaskId, ledger]);

  const saveLedger = async (newLedger: TaskLedger) => {
    setIsSending(true);
    try {
      // Optimistic update
      mutate('/api/dev/tasks', newLedger, false);

      await fetch('/api/dev/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLedger),
      });

      // Global revalidate
      mutate('/api/dev/tasks');
    } catch (err) {
      console.error('Failed to save ledger:', err);
    } finally {
      setIsSending(false);
    }
  };

  const fetchFileContent = async (filePath: string) => {
    setIsPreviewLoading(true);
    try {
      const res = await fetch(`/api/dev/tasks?file=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.content) {
        const isMarkdown = filePath.toLowerCase().endsWith('.md');
        const content = isMarkdown 
          ? data.content 
          : `\`\`\`${filePath.split('.').pop()}\n${data.content}\n\`\`\``;
        setPreviewFile({ path: filePath, content });
      }
    } catch (err) {
      console.error('Failed to fetch file:', err);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const addTask = () => {
    if (!newTaskTitle.trim() || !ledger) return;
    
    const newTask: Task = {
      id: `TASK-${Math.floor(Math.random() * 900) + 100}`,
      title: newTaskTitle,
      status: 'pending',
      priority: 'medium',
      history: [
        {
          role: 'user',
          content: `Initial requirement: ${newTaskTitle}`,
          time: new Date().toISOString(),
        }
      ],
      affected_files: []
    };

    const updatedLedger = {
      ...ledger,
      tasks: [newTask, ...ledger.tasks]
    };

    saveLedger(updatedLedger);
    setNewTaskTitle('');
    setIsAddingTask(false);
    setSelectedTaskId(newTask.id);
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !ledger || !selectedTaskId) return;

    const updatedTasks = ledger.tasks.map(task => {
      if (task.id === selectedTaskId) {
        return {
          ...task,
          status: 'pending' as const, // Reset to pending when user replies
          history: [
            ...task.history,
            {
              role: 'user' as const,
              content: newMessage,
              time: new Date().toISOString(),
            }
          ]
        };
      }
      return task;
    });

    saveLedger({ ...ledger, tasks: updatedTasks });
    setNewMessage('');
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    if (!ledger) return;
    const updatedTasks = ledger.tasks.map(task => 
      task.id === id ? { ...task, status } : task
    );
    saveLedger({ ...ledger, tasks: updatedTasks });
  };

  const selectedTask = ledger?.tasks.find(t => t.id === selectedTaskId);

  if (!ledger && !error) return <div className="flex h-screen items-center justify-center">Loading Ledger...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-destructive">Failed to load ledger.</div>;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-primary">
            <ClipboardList className="w-5 h-5" />
            Task Ledger
          </div>
          <div className="flex items-center gap-1">
            <Link href="/dev/tasks/flow">
              <Button variant="ghost" size="icon" title="User Flow Map">
                <Waypoints className="w-4 h-4" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => setIsAddingTask(true)}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {isAddingTask && (
              <Card className="p-3 border-primary shadow-sm">
                <Input 
                  autoFocus
                  placeholder="What needs to be done?"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isSending && addTask()}
                  disabled={isSending}
                  className="mb-2"
                />
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={addTask} disabled={isSending}>
                    {isSending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                    Add
                  </Button>
                  <Button size="sm" variant="ghost" className="flex-1" onClick={() => setIsAddingTask(false)} disabled={isSending}>Cancel</Button>
                </div>
              </Card>
            )}

            {ledger?.tasks.map(task => (
              <div 
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedTaskId === task.id 
                    ? 'bg-primary/10 border-primary/50 border' 
                    : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Badge variant="outline" className="text-[10px] py-0">{task.id}</Badge>
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : task.status === 'in_progress' ? (
                    <Clock className="w-3 h-3 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                  )}
                </div>
                <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                <div className="flex gap-2 mt-2">
                    <Badge className={`text-[9px] px-1 py-0 border-none ${
                      task.priority === 'high' ? 'bg-red-500 hover:bg-red-600' : task.priority === 'medium' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'
                    }`}>
                      {task.priority}
                    </Badge>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedTask ? (
          <>
            <header className="p-6 border-b flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{selectedTask.title}</h1>
                  <Badge variant="outline">{selectedTask.status}</Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                   <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Updated: {new Date(selectedTask.history[selectedTask.history.length-1].time).toLocaleString()}</span>
                   {selectedTask.affected_files && selectedTask.affected_files.length > 0 && (
                     <div className="flex items-center gap-2">
                       <FileCode className="w-3 h-3" />
                       <div className="flex flex-wrap gap-1">
                         {selectedTask.affected_files.map(file => (
                           <Badge 
                             key={file} 
                             variant="secondary" 
                             className="text-[10px] cursor-pointer hover:bg-primary/20 flex items-center gap-1 py-0 px-2"
                             onClick={() => fetchFileContent(file)}
                           >
                             {file.split('/').pop()}
                             <ExternalLink className="w-2 h-2" />
                           </Badge>
                         ))}
                       </div>
                     </div>
                   )}
                </div>
              </div>
              <div className="flex gap-2">
                {selectedTask.status !== 'in_progress' && selectedTask.status !== 'done' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTaskStatus(selectedTask.id, 'in_progress')}
                    className="gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Start Task
                  </Button>
                )}
                {selectedTask.status === 'done' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTaskStatus(selectedTask.id, 'pending')}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Re-open
                  </Button>
                )}
                {selectedTask.status !== 'done' && (
                  <Button 
                    size="sm"
                    onClick={() => updateTaskStatus(selectedTask.id, 'done')}
                    className="bg-green-600 hover:bg-green-700 gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark Done
                  </Button>
                )}
              </div>
            </header>

            <ScrollArea className="flex-1 p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {selectedTask.history.map((msg, i) => (
                  <div key={i} className={`flex gap-4 ${msg.role === 'agent' ? 'flex-row' : 'flex-row-reverse'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'agent' ? 'bg-primary text-primary-foreground' : 'bg-muted border'
                    }`}>
                      {msg.role === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div className={`space-y-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : ''}`}>
                      <div className={`p-4 rounded-2xl ${
                        msg.role === 'agent' 
                          ? 'bg-muted/50 rounded-tl-none border' 
                          : 'bg-primary text-primary-foreground rounded-tr-none shadow-md'
                      }`}>
                        <div className={`text-sm prose prose-sm max-w-none ${
                          msg.role === 'user' ? 'prose-invert text-primary-foreground' : 'dark:prose-invert'
                        }`}>
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground px-2">
                        {new Date(msg.time).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </ScrollArea>

            <footer className="p-4 border-t bg-muted/10">
              <div className="max-w-3xl mx-auto relative flex items-end gap-2">
                <Textarea 
                  placeholder={isSending ? "Updating memory..." : "Suggest improvements or give feedback..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey && !isSending) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={isSending}
                  className="min-h-[52px] max-h-[200px] py-3 px-4 rounded-xl shadow-sm focus-visible:ring-primary resize-none"
                />
                <Button 
                  size="icon" 
                  className="rounded-lg h-[52px] w-[52px] shrink-0"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || isSending}
                >
                  {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
              <Layout className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold">No Task Selected</h2>
            <p className="text-muted-foreground max-w-sm">
              Select a task from the sidebar to view history or click the plus icon to start a new feature thread.
            </p>
          </div>
        )}
      </div>
      <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
        <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-primary/20 shadow-2xl">
          <DialogHeader className="p-6 border-b bg-muted/30 shrink-0">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <DialogTitle className="text-xl font-mono">{previewFile?.path}</DialogTitle>
            </div>
            <DialogDescription>
              Previewing the current version of this file in the project.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-8 bg-background">
            <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-muted prose-pre:text-muted-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground">
              <ReactMarkdown>{previewFile?.content || ''}</ReactMarkdown>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Loading Overlay for File Preview */}
      {isPreviewLoading && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-[100] flex items-center justify-center">
          <div className="bg-background border p-4 rounded-xl shadow-lg flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span className="text-sm font-medium">Fetching file content...</span>
          </div>
        </div>
      )}
    </div>
  );
}
