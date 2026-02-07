"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Search, ShieldCheck, Users } from "lucide-react";
import AssignmentsView from "./assignments-view";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ClassDetailsProps {
    classId: Id<"classes">;
    onBack: () => void;
    isTeacherOrAdmin: boolean;
}

export default function ClassDetails({ classId, onBack, isTeacherOrAdmin }: ClassDetailsProps) {
    const classInfo = useQuery(api.classes.get, { id: classId });
    const members = useQuery(api.classes.listMembers, { classId });
    // const addMember = useMutation(api.classes.addMember); // Need to implement searching org members to add

    if (classInfo === undefined) return <div className="p-8 text-center">Loading class...</div>;
    if (classInfo === null) return <div className="p-8 text-center text-red-500">Class not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold">{classInfo.name}</h2>
                        <p className="text-sm text-gray-500">{classInfo.description || "No description"}</p>
                    </div>
                </div>
                {isTeacherOrAdmin && (
                    <Button variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Student
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    {/* Assignments Section */}
                    <AssignmentsView classId={classId} isTeacherOrAdmin={isTeacherOrAdmin} />

                    {/* Roster Section */}
                    <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-900">Student Roster</h3>
                            <span className="text-xs font-medium bg-gray-200 px-2 py-1 rounded-full text-gray-600">
                                {members?.length || 0} Students
                            </span>
                        </div>
                        
                        {members === undefined ? (
                            <div className="p-8 text-center text-gray-400">Loading roster...</div>
                        ) : members.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
                                    <Users className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No students enrolled yet</p>
                                {isTeacherOrAdmin && (
                                    <p className="text-sm text-gray-400 mt-1">Add students from your organization to get started.</p>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y">
                                {members.map((member) => (
                                    <div key={member._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src="" />
                                                <AvatarFallback className="bg-blue-100 text-blue-700">
                                                    {member.user?.fullName?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{member.user?.fullName || "Unknown User"}</p>
                                                <p className="text-xs text-gray-500">{member.user?.email}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white border rounded-xl shadow-sm p-6">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            Class Info
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Teacher</span>
                                <span className="font-medium text-gray-900">You</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="font-medium text-gray-900">{new Date(classInfo.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="pt-3 border-t">
                                <span className="text-gray-500 block mb-1">Invite Code</span>
                                <code className="block w-full bg-gray-100 p-2 rounded text-center font-mono text-xs select-all cursor-pointer hover:bg-gray-200">
                                    {/* Placeholder for future join code feature */}
                                    CLS-{classInfo._id.slice(-6).toUpperCase()}
                                </code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
