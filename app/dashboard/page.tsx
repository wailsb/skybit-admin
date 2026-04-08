import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSessionUser } from "@/lib/session"
import { Database } from "@/config/db"

export default async function Page() {
  const user = await getSessionUser();
  const db = Database.getInstance().getClient();
  await db.connect();
  
  // Fetch real data counts
  const clientsCount = await db.db('skybit').collection('clients').countDocuments();
  const servicesCount = await db.db('skybit').collection('services').countDocuments();
  const teamCount = await db.db('skybit').collection('team').countDocuments();
  const submissionsCount = await db.db('skybit').collection('form').countDocuments();

  // Fetch recent data for Table
  const recentSubmissions = await db.db('skybit').collection('form')
    .find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .toArray();

  const formattedSubmissions = recentSubmissions.map((sub, index) => ({
    id: index + 1,
    header: sub.name || "Anonymous",
    type: sub.service || "General Inquiry",
    status: sub.status || "Pending",
    target: sub.email || "N/A",
    limit: sub.date || (sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : "Recent"),
    reviewer: "Unassigned"
  }));

  const stats = {
    clients: clientsCount,
    services: servicesCount,
    team: teamCount,
    submissions: submissionsCount
  };

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
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards stats={stats} />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={formattedSubmissions} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
