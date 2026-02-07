export default function OrgTeacherView({ slug = "demo" }: { slug?: string }) {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
            <p className="text-muted-foreground">Organization: {slug}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h2 className="text-xl font-semibold mb-2">My Classes</h2>
                    <p>View and manage your active classes.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h2 className="text-xl font-semibold mb-2">Create Quiz</h2>
                    <p>Build new assessments for your students.</p>
                </div>
                <div className="p-6 border rounded-lg shadow-sm bg-card">
                    <h2 className="text-xl font-semibold mb-2">Analytics</h2>
                    <p>Track student performance and progress.</p>
                </div>
            </div>
        </div>
    );
}
