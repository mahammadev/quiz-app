import { Button } from "@/components/ui/button"
import Link from "next/link"
import { School, LogOut, User } from "lucide-react"

export default function TeacherLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <Link href="/teacher" className="flex items-center gap-2 font-bold text-xl text-primary transition-colors hover:text-primary/80">
                            <School className="h-6 w-6" />
                            <span>Teacher Portal</span>
                        </Link>
                    </div>
                    <nav className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline-block">Professor</span>
                        </div>
                        <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-destructive transition-colors">
                            <LogOut className="h-4 w-4" />
                            <span className="hidden sm:inline">Logout</span>
                        </Button>
                    </nav>
                </div>
            </header>
            <main className="container px-4 py-8 max-w-7xl mx-auto">
                {children}
            </main>
        </div>
    )
}
