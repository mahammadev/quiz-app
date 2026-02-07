import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowRight, Map, CheckSquare, Bug } from "lucide-react";

const tools = [
  {
    title: "Page Flow",
    description: "Visualise the application interface types and their connectivity graph.",
    href: "/dev/pageflow",
    icon: Map,
    color: "text-blue-500",
  },
  {
    title: "Task Manager",
    description: "Track development tasks, milestones, and project progress.",
    href: "/dev/tasks",
    icon: CheckSquare,
    color: "text-green-500",
  },
  {
    title: "Debug Router",
    description: "Inspect routing parameters and test navigation behavior.",
    href: "/debug-router",
    icon: Bug,
    color: "text-orange-500",
  },
];

export default function DevDashboard() {
  return (
    <div className="container mx-auto py-10 px-4 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground mt-2">
          Utilities for debugging, visualization, and project management.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.href} href={tool.href} className="block group h-full">
              <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-muted ${tool.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {tool.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
