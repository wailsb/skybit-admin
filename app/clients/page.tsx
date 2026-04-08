import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import Link from "next/link";
import { Database } from "@/config/db";
import { getSessionUser } from "@/lib/session";
import { ControlMenu } from "@/components/control-menu";
import Image from "next/image";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const user = await getSessionUser();
  const db = Database.getInstance().getClient();
  await db.connect();
  const collection = db.db('skybit').collection('clients');
  
  // Apply search filter if present
  const filter = q ? {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } }
    ]
  } : {};
  
  const clients = await collection.find(filter).toArray();

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
          <div className="flex flex-col gap-6 p-4 md:p-6">
            <ControlMenu 
              title="Clients" 
              description="Manage your client portfolio and projects."
              addLabel="Add Client"
              addHref="/clients/new"
            />
            
            {clients.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {clients.map((client) => (
                  <Card key={client._id.toString()} className="flex flex-col">
                    <div className="relative">
                      <Image
                        src={client.imageUrl || client.ImageUrl}
                        alt={client.name}
                        fill
                        className="rounded-t-lg object-cover brightness-90 dark:brightness-60"
                      />
                      <div className="aspect-[3/2] w-full" />
                      <div className="absolute inset-0 rounded-t-lg bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <Badge
                        variant="secondary"
                        className="absolute bottom-2 left-3 text-xs"
                      >
                        {client.projectCount} project{client.projectCount !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base">{client.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {client.company} · {client.email}
                      </CardDescription>
                    </CardHeader>
                    <div className="flex-1" />
                    <CardFooter className="flex flex-col gap-2">
                      <Link
                        href={`/clients/${client._id.toString()}`}
                        className="inline-flex w-full shrink-0 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all h-8 gap-1.5 hover:bg-primary/80"
                      >
                        Modify
                      </Link>
                      <DeleteButton id={client._id.toString()} endpoint="/api/clients" itemName="client" />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <ControlMenu title="" description="" addLabel="" addHref="" /> {/* Hidden but for icon access if needed, better to just use icon */}
                  <span className="text-2xl text-primary">📂</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold">No clients found</h3>
                <p className="mb-6 mt-2 text-sm text-muted-foreground max-w-xs">
                  {q ? `No results found for "${q}". Try a different search term or add a new client.` : "Your client list is currently empty. Start by adding your first client."}
                </p>
                <Link
                  href="/clients/new"
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80"
                >
                  Add Client
                </Link>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
