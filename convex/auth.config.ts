export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_URL!,
      applicationID: process.env.CLERK_JWT_TEMPLATE || "convex",
    },
  ],
};
