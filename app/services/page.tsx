import { AppSidebar } from "@/components/app-sidebar";
import { SidebarHeader, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CardImage } from "@/components/ui/CardImage";
import { Database } from "@/config/db";
import { getSessionUser } from "@/lib/session";
import { ControlMenu } from "@/components/control-menu";
import Link from "next/link";

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await getSessionUser();
  const db = Database.getInstance().getClient();
  await db.connect();
  const collection = db.db('skybit').collection('services');

  // Apply search filter if present
  const filter = q ? {
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  } : {};
  
  const services = await collection.find(filter).toArray();

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
        <SidebarHeader/>
        <div className="flex flex-col gap-6 p-4 md:p-6">
            <ControlMenu 
              title="Services" 
              description="Manage the services provided by SkyBit."
              addLabel="Add Service"
              addHref="/services/new"
            />
            
            {services.length > 0 ? (
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                      <CardImage
                          key={service._id.toString()}
                          id={service._id.toString()}
                          title={service.title}
                          description={service.description}
                          imageUrl={service.ImageUrl || service.imageUrl}
                          linkTo={`/services/${service._id.toString()}`}
                          badgeText={service.featured ? "Featured" : undefined}
                      />
                  ))}
              </ul>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-2xl text-primary">🛠️</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">No services found</h3>
                <p className="mb-6 mt-2 text-sm text-muted-foreground max-w-xs">
                  {q ? `No results found for "${q}". Try a different search term or add a new service.` : "Your service list is currently empty. Define your offerings to get started."}
                </p>
                <Link
                  href="/services/new"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  Add Service
                </Link>
              </div>
            )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}