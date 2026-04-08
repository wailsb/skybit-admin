import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { FormSubmissionsTable } from "@/components/form-submissions-table";
import { Database } from "@/config/db";
import { getSessionUser } from "@/lib/session";
import { ContactSubmission } from "../Types";

export default async function FormPage() {
  const user = await getSessionUser();
  const db = Database.getInstance().getClient();
  await db.connect();
  const collection = db.db('skybit').collection('forms');
  const formsRaw = await collection.find({}).sort({ submittedAt: -1 }).toArray();
  
  const forms = formsRaw.map(f => ({
    ...f,
    id: f._id.toString(),
  })) as unknown as ContactSubmission[];

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} />

      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Contact Submissions</h2>
                <p className="text-sm text-muted-foreground">
                  View and manage contact form submissions from clients.
                </p>
              </div>
              <span className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-muted-foreground">
                {forms.length} submissions
              </span>
            </div>
            <FormSubmissionsTable initialData={forms} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}