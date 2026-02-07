import OrgAdminView from "@/components/org-dashboards/admin-view";

export default async function OrgAdminDashboard({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    return <OrgAdminView slug={slug} />;
}
