import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { ClientEditForm } from "@/components/client-edit-form";
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

export default async function ClientEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  
  let client = null;
  const isNew = id === "new";

  if (!isNew) {
    try {
      const db = Database.getInstance().getClient();
      await db.connect();
      const collection = db.db('skybit').collection('clients');
      client = await collection.findOne({ _id: new ObjectId(id) });
      if (client) {
        client = {
          ...client,
          id: client._id.toString(),
          imageUrl: client.imageUrl || client.ImageUrl || ""
        };
      }
    } catch (e) {
      console.error("Error fetching client:", e);
    }
  } else {
    // Default data for new client
    client = {
      id: "new",
      name: "",
      company: "",
      email: "",
      projectCount: 0,
      imageUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=2073&auto=format&fit=crop"
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
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/clients">Clients</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {isNew ? "New Client" : (client ? client.name : "Not Found")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {client ? (
              <ClientEditForm client={client as any} isNew={isNew} />
            ) : (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    Client Not Found
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    No client with ID &ldquo;{id}&rdquo; exists.
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
