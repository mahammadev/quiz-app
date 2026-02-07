"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function OrgRoutingPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const role = useQuery(api.orgMembers.getMyRole, { orgSlug: slug });

    useEffect(() => {
        // If role is undefined, it means loading. If it's null, user is not a member.
        if (role === undefined) return;

        if (role === "admin") {
            router.push(`/org/${slug}/admin`);
        } else if (role === "teacher") {
            router.push(`/org/${slug}/teacher`);
        } else if (role === "student") {
            router.push(`/org/${slug}/student`);
        } else {
            // Not a member or invalid role
            // TODO: Redirect to a "Join" page or 404
            // For now, staying here means showing the access denied message below
        }
    }, [role, slug, router]);

    if (role === undefined) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading organization...</span>
            </div>
        );
    }

    if (role === null) {
         return (
            <div className="flex h-screen items-center justify-center flex-col">
                <h1 className="text-xl font-bold mb-2">Access Denied</h1>
                <p className="text-muted-foreground">You are not a member of this organization.</p>
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                    Return to Dashboard
                </button>
            </div>
         );
    }

    return (
        <div className="flex h-screen items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             <span className="ml-2 text-muted-foreground">Redirecting to dashboard...</span>
        </div>
    );
}
