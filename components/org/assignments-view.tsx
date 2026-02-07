"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, PlayCircle, Plus } from "lucide-react";
import Link from "next/link";

interface AssignmentsViewProps {
    classId: Id<"classes">;
    isTeacherOrAdmin: boolean;
}

export default function AssignmentsView({ classId, isTeacherOrAdmin }: AssignmentsViewProps) {
    const assignments = useQuery(api.classes.listAssignments, { classId });

    if (assignments === undefined) {
        return <div className="text-center py-8 text-gray-400">Loading assignments...</div>;
    }

    return (
        <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Assignments</h3>
                {isTeacherOrAdmin && (
                    <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Assign Quiz
                    </Button>
                )}
            </div>

            {assignments.length === 0 ? (
                <div className="p-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                        <FileText className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No active assignments</p>
                    {isTeacherOrAdmin ? (
                        <p className="text-sm text-gray-400 mt-1">Assign a quiz to this class to get started.</p>
                    ) : (
                        <p className="text-sm text-gray-400 mt-1">Great job! You're all caught up.</p>
                    )}
                </div>
            ) : (
                <div className="divide-y">
                    {assignments.map((a) => (
                        <div key={a._id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold text-gray-900">{a.quizName}</h4>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        {a.quizQuestionCount} Questions
                                    </span>
                                    {a.dueDate && (
                                        <span className="flex items-center gap-1 text-amber-600">
                                            <Calendar className="w-3 h-3" />
                                            Due {new Date(a.dueDate).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            
                            {!isTeacherOrAdmin ? (
                                <Link href={`/quiz/${a.quizId}`}>
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                        <PlayCircle className="w-4 h-4 mr-2" />
                                        Start
                                    </Button>
                                </Link>
                            ) : (
                                <Button size="sm" variant="ghost">View Stats</Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
