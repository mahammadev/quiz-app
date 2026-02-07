import OrgStudentView from "@/components/org-dashboards/student-view";

export default async function OrgStudentDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <OrgStudentView slug={slug} />;
}
