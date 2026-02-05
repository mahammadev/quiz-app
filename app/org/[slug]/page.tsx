import OrgDashboard from "@/components/org/org-dashboard";

export default function OrgPage({ params }: { params: { slug: string } }) {
    return <OrgDashboard slug={params.slug} />;
}
