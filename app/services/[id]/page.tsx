import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { ServiceEditForm } from "@/components/service-edit-form";
import { Database } from "@/config/db";
import { ObjectId } from "mongodb";
import { getSessionUser } from "@/lib/session";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function ServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  
  let service = null;
  const isNew = id === "new";

  if (!isNew) {
    try {
      const db = Database.getInstance().getClient();
      await db.connect();
      const collection = db.db('skybit').collection('services');
      service = await collection.findOne({ _id: new ObjectId(id) });
      if (service) {
        // Form expects 'id' string and specific properties
        service = {
          ...service,
          id: service._id.toString(),
          ImageUrl: service.ImageUrl || service.imageUrl || ""
        };
      }
    } catch (e) {
      console.error("Error fetching service:", e);
    }
  } else {
    // Default data for new service
    service = {
      id: "new",
      title: "",
      description: "",
      ImageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      linkto: ""
    };
  }

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
            {/* Breadcrumb */}
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/services">Services</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {isNew ? "New Service" : (service ? service.title : "Not Found")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {/* Content */}
            {service ? (
              <ServiceEditForm service={service as any} isNew={isNew} />
            ) : (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    Service Not Found
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    No service with ID &ldquo;{id}&rdquo; exists.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
