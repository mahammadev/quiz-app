"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

/**
 * Syncs the Clerk user data with the Convex users table.
 * This runs whenever the user's auth state changes.
 */
export function UserSync() {
    const { user, isLoaded } = useUser();
    const storeUser = useMutation(api.users.store);

    useEffect(() => {
        if (isLoaded && user) {
            storeUser({
                fullName: user.fullName || "Anonymous",
                email: user.primaryEmailAddress?.emailAddress || "",
            });
        }
    }, [isLoaded, user, storeUser]);

    return null;
}
