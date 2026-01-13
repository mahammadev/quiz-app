import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Clerk webhook handler for user sync
http.route({
    path: "/clerk-webhook",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        const payload = await request.json();
        const eventType = payload.type;

        // Handle user.created and user.updated events
        if (eventType === "user.created" || eventType === "user.updated") {
            const { id, email_addresses, first_name, last_name } = payload.data;

            const email = email_addresses[0]?.email_address || "";
            const fullName = `${first_name || ""} ${last_name || ""}`.trim() || email;

            await ctx.runMutation(api.users.syncUser, {
                clerkId: id,
                email,
                fullName,
            });
        }

        return new Response(null, { status: 200 });
    }),
});

export default http;
