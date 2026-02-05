"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { getTranslation } from "@/lib/translations";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MembersView from "./members-view";

interface OrgDashboardProps {
    slug: string;
}

export default function OrgDashboard({ slug }: OrgDashboardProps) {
    const language = "az";

    // 1. Fetch Org Details
    const org = useQuery(api.organizations.getBySlug, { slug });

    // 2. Fetch Quizzes (only if we have org info)
    const quizzes = useQuery(api.quizzes.listByOrg, org ? { orgId: org._id } : "skip");

    if (org === undefined) {
        return <div className="p-8 text-center">Loading organization...</div>;
    }

    if (org === null) {
        return <div className="p-8 text-center text-red-500">Organization not found</div>;
    }

    return (
        <div className="container mx-auto p-6 max-w-5xl">
            <header className="mb-8 border-b pb-4 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{org.name}</h1>
                    <p className="text-gray-500">Organization Dashboard</p>
                </div>
            </header>

            <Tabs defaultValue="quizzes" className="w-full">
                <TabsList className="mb-8">
                    <TabsTrigger value="quizzes">
                        {getTranslation(language, "nav.quizzes") || "Quizzes"}
                    </TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>

                <TabsContent value="quizzes">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold opacity-0 h-0 w-0 overflow-hidden">Quizzes</h2>
                        </div>

                        {quizzes === undefined ? (
                            <div className="py-8 text-center text-gray-400">Loading quizzes...</div>
                        ) : quizzes.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg p-8 text-center border border-dashed border-gray-300">
                                <p className="text-gray-500 mb-2">No quizzes found for this organization.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {quizzes.map((quiz) => (
                                    <Link
                                        key={quiz._id}
                                        href={`/quiz/${quiz._id}`}
                                        className="block group"
                                    >
                                        <div className="bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-400">
                                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 truncate mb-1">
                                                {quiz.name}
                                            </h3>
                                            <div className="flex justify-between items-center text-sm text-gray-500 mt-3">
                                                <span>{quiz.questions.length} questions</span>
                                                <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            {quiz.visibility === 'private' && (
                                                <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                    Private
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </TabsContent>

                <TabsContent value="members">
                    <MembersView orgId={org._id} isOwner={true} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
