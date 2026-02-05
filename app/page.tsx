import { auth } from "@clerk/nextjs/server";
import LandingPage from "@/components/landing-page";
import DashboardClient from "@/components/dashboard-client";

/**
 * Root page component.
 * This is a React Server Component that uses Clerk's server-side auth() 
 * to determine whether to render the Landing Page or the Dashboard.
 */
export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300 overflow-x-hidden">
      {userId ? <DashboardClient /> : <LandingPage />}
    </main>
  );
}
