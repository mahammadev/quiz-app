import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/animated-tabs"
import { Loader2 } from "lucide-react"

export default function MockDashboard() {
    return (
        <div className="container mx-auto max-w-5xl px-3 sm:px-6 py-4 sm:py-8 min-h-screen flex flex-col w-full">
            <header className="flex justify-between items-center mb-4 sm:mb-8 relative z-50">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200" />
                        <div className="h-8 w-24 bg-slate-100 rounded-lg animate-pulse" />
                    </div>
                </div>
            </header>

            <Tabs defaultValue="quiz" className="w-full flex flex-col flex-1 space-y-4">
                <div className="mb-6 w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-auto shadow-sm">
                        <TabsTrigger value="library" className="py-2">Library</TabsTrigger>
                        <TabsTrigger value="quiz" className="py-2">Quiz</TabsTrigger>
                        <TabsTrigger value="mistakes" className="py-2">Mistakes</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="quiz" className="mt-0 flex-1">
                    <Card className="w-full py-0 shadow-lg border-none sm:border overflow-hidden">
                        <CardContent className="p-4 sm:p-8 flex flex-col items-center justify-center min-h-[400px] gap-4">
                           <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center w-full max-w-md">
                               <p className="text-muted-foreground">Upload or Select a Quiz</p>
                           </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
