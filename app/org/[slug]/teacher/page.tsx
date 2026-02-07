import OrgTeacherView from "@/components/org-dashboards/teacher-view";

export default async function OrgTeacherDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <OrgTeacherView slug={slug} />;
}
