import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { TeamEditForm } from "@/components/team-edit-form";
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

export default async function TeamEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  
  let member = null;
  const isNew = id === "new";

  if (!isNew) {
    try {
      const db = Database.getInstance().getClient();
      await db.connect();
      const collection = db.db('skybit').collection('team');
      member = await collection.findOne({ _id: new ObjectId(id) });
      if (member) {
        member = {
          ...member,
          id: member._id.toString(),
          imageUrl: member.imageUrl || member.ImageUrl || ""
        };
      }
    } catch (e) {
      console.error("Error fetching team member:", e);
    }
  } else {
    // Default data for new team member
    member = {
      id: "new",
      name: "",
      email: "",
      role: "",
      bio: "",
      imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
      socials: { twitter: "", linkedin: "", github: "" }
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
                  <BreadcrumbLink href="/team">Our Team</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>
                    {isNew ? "New Member" : (member ? member.name : "Not Found")}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>

            {member ? (
              <TeamEditForm member={member as any} isNew={isNew} />
            ) : (
              <div className="flex flex-1 items-center justify-center py-20">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-foreground">
                    Member Not Found
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    No team member with ID &ldquo;{id}&rdquo; exists.
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
