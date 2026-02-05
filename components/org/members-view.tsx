"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MembersViewProps {
    orgId: string;
    isOwner: boolean; // or isAdmin
}

export default function MembersView({ orgId, isOwner }: MembersViewProps) {
    const listMembers = useQuery(api.orgMembers.listMembers, { orgId: orgId as any });
    const generateCode = useMutation(api.join.generateCode);

    // We need to fetch the org to see the code
    const org = useQuery(api.organizations.get, { id: orgId as any });

    const [inviteEmail, setInviteEmail] = useState("");
    const createInvite = useMutation(api.invitations.create);
    const [inviteOpen, setInviteOpen] = useState(false);

    const handleGenerateCode = async () => {
        await generateCode({ orgId: orgId as any });
    };

    const handleInvite = async () => {
        await createInvite({
            orgId: orgId as any,
            email: inviteEmail,
            role: "teacher"
        });
        setInviteOpen(false);
        setInviteEmail("");
        // Show success toast
    };

    if (!listMembers || !org) return <div className="text-center py-4 text-gray-500">Loading members...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Student Join Code Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Student Join Code</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-100 p-4 rounded-lg text-2xl font-mono tracking-widest text-center flex-1 border border-gray-200">
                                {org.studentJoinCode || "NONE"}
                            </div>
                        </div>
                        <p className="text-sm text-gray-500">
                            Share this code with students. They can join directly from their dashboard.
                        </p>
                        {isOwner && (
                            <Button onClick={handleGenerateCode} variant="outline" className="w-full">
                                {org.studentJoinCode ? "Rotate Code" : "Generate Code"}
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {/* Invite Teachers Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Invite Teachers</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                            <DialogTrigger asChild>
                                <Button className="w-full">Invite Teacher via Email</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Invite Teacher</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <Input
                                        placeholder="teacher@school.edu"
                                        value={inviteEmail}
                                        onChange={(e) => setInviteEmail(e.target.value)}
                                    />
                                    <Button onClick={handleInvite} className="w-full">Send Invitation</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <p className="text-sm text-gray-500 mt-4">
                            Teachers can create quizzes and assign them to students.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Members Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Members ({listMembers.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listMembers.map((m: any) => (
                                <TableRow key={m._id}>
                                    <TableCell className="font-medium">
                                        {/* Look up user details? listMembers returns raw rows. 
                                            Ideally we join with Users table, but we don't have direct access here easily without complex query.
                                            For now, show ID or if convex returns user details (it doesn't yet).
                                            Wait, orgMembers.ts list function should return User details!
                                        */}
                                        {m.userId.substring(0, 10)}...
                                        {/* TODO: Enrich with user names */}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={m.role === 'admin' ? 'default' : m.role === 'teacher' ? 'secondary' : 'outline'}>
                                            {m.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-gray-500 text-sm">
                                        {new Date(m.addedAt).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
