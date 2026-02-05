"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";

export default function InvitePage({ params }: { params: { token: string } }) {
    const { token } = params;
    const { user, isLoaded } = useUser();
    const router = useRouter();

    // Fetch invite details
    // Note: this query is public (no auth check inside getByToken usually, but we might want one? 
    // Actually typically invite links are public up to the point of viewing, but accepting requires auth.
    // My getByToken doesn't check auth, which is fine for viewing "You are invited to...".
    const inviteData = useQuery(api.invitations.getByToken, { token });

    const acceptInvite = useMutation(api.invitations.accept);
    const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");

    const handleAccept = async () => {
        if (!user) {
            // Redirect to login preserving url? 
            // Clerk handles this usually if we are protected. 
            // But this page might be public.
            // For now, assume user must be logged in to click Accept.
            return;
        }

        setStatus("accepting");
        try {
            const result = await acceptInvite({ token });
            setStatus("success");
            // Redirect to Org Dashboard
            // We need slug. result returns orgId.
            // We can fetch org slug or just redirect to /dashboard and let them find it.
            // ideally acceptInvite returns slug too?
            // Or we check inviteData.org.slug
            if (inviteData?.org) {
                router.push(`/org/${inviteData.org.slug}`);
            } else {
                router.push("/");
            }
        } catch (err) {
            console.error(err);
            setStatus("error");
        }
    };

    if (!isLoaded) return null;

    if (inviteData === undefined) {
        return <div className="min-h-screen flex items-center justify-center">Loading invitation...</div>;
    }

    if (inviteData === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>This invitation link is invalid or has expired.</p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={() => router.push("/")} variant="outline" className="w-full">Go Home</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    const { invite, org } = inviteData;

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Join Organization</CardTitle>
                    <CardDescription>You have been invited to join</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    {org && (
                        <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-xl text-gray-900">{org.name}</h3>
                        </div>
                    )}

                    <div className="py-2">
                        <p className="text-gray-600">
                            You will join as a <span className="font-semibold uppercase text-blue-600">{invite.role}</span>.
                        </p>
                    </div>

                    {!user && (
                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm mb-4">
                            You must be logged in to accept this invitation.
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                    {user ? (
                        <Button
                            className="w-full text-lg py-6"
                            onClick={handleAccept}
                            disabled={status === "accepting" || status === "success"}
                        >
                            {status === "accepting" ? "Joining..." : status === "success" ? "Success!" : "Accept Invitation"}
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={() => router.push("/sign-in")}>
                            Log in to Accept
                        </Button>
                    )}

                    {status === "error" && (
                        <p className="text-red-500 text-sm">Failed to accept. Detailed error in console.</p>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
