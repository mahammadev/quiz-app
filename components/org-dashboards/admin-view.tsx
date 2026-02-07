export default function OrgAdminView({ slug = "demo" }: { slug?: string }) {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <p className="text-muted-foreground">Organization: {slug}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h2 className="text-xl font-semibold mb-2">Manage Members</h2>
                    <p>Invite teachers and manage student access.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h2 className="text-xl font-semibold mb-2">Org Settings</h2>
                    <p>Update logo, branding, and permissions.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h2 className="text-xl font-semibold mb-2">Billing</h2>
                    <p>Manage subscription and plan details.</p>
                </div>
            </div>
        </div>
    );
}
