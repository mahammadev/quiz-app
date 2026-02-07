"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Users, BookOpen, MoreVertical, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "@/convex/_generated/dataModel";
import ClassDetails from "./class-details";

interface ClassesViewProps {
    orgId: Id<"organizations">;
    role?: string; // "admin", "teacher", "student"
}

export default function ClassesView({ orgId, role }: ClassesViewProps) {
    const classes = useQuery(api.classes.listByOrg, { orgId });
    const createClass = useMutation(api.classes.create);
    
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<Id<"classes"> | null>(null);
    const [newClassName, setNewClassName] = useState("");
    const [newClassDesc, setNewClassDesc] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isTeacherOrAdmin = role === "admin" || role === "teacher";

    const handleCreateClass = async () => {
        if (!newClassName.trim()) return;
        setIsSubmitting(true);
        try {
            await createClass({
                name: newClassName,
                description: newClassDesc,
                orgId,
            });
            setIsCreateOpen(false);
            setNewClassName("");
            setNewClassDesc("");
        } catch (error) {
            console.error("Failed to create class:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (selectedClassId) {
        return (
            <ClassDetails 
                classId={selectedClassId} 
                onBack={() => setSelectedClassId(null)}
                isTeacherOrAdmin={isTeacherOrAdmin}
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Active Classes</h2>
                    <p className="text-sm text-gray-500">Manage your classroom groups and assignments</p>
                </div>
                {isTeacherOrAdmin && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Class
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Class</DialogTitle>
                                <DialogDescription>
                                    Create a group to organize students and assign quizzes.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Class Name</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="e.g. Biology 101 - Fall 2026"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="desc">Description (Optional)</Label>
                                    <Textarea 
                                        id="desc" 
                                        placeholder="Brief description of the class..."
                                        value={newClassDesc}
                                        onChange={(e) => setNewClassDesc(e.target.value)}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button onClick={handleCreateClass} disabled={isSubmitting || !newClassName.trim()}>
                                    {isSubmitting ? "Creating..." : "Create Class"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {classes === undefined ? (
                <div className="text-center py-12 text-gray-400">Loading classes...</div>
            ) : classes.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 border border-dashed rounded-lg">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                        <BookOpen className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No classes yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mt-2">
                        {isTeacherOrAdmin 
                            ? "Get started by creating your first class group to add students."
                            : "You haven't been added to any classes yet."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {classes.map((c) => (
                        <div 
                            key={c._id} 
                            className="bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group overflow-hidden"
                            onClick={() => setSelectedClassId(c._id)}
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                        {c.name.charAt(0).toUpperCase()}
                                    </div>
                                    {isTeacherOrAdmin && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-gray-400 hover:text-gray-600">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem className="text-red-600 cursor-pointer">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete Class
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                    {c.name}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                                    {c.description || "No description provided."}
                                </p>
                            </div>
                            <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center text-xs text-gray-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>View Students</span>
                                </div>
                                <span>Created {new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
