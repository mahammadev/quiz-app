import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Helper: Get the current user's Clerk ID
 * Throws if not authenticated
 */
export const getCurrentUserId = async (ctx: { auth: { getUserIdentity: () => Promise<Record<string, unknown> | null> } }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized");
    }
    return identity.subject as string;
};
