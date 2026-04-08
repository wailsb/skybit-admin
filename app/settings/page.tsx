import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { SettingsForm } from "@/components/settings-form";
import { Database } from "@/config/db";
import { getSessionUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await getSessionUser();
  const db = Database.getInstance().getClient();
  await db.connect();
  const collection = db.db('skybit').collection('settings');
  const settingsRaw = await collection.findOne({});
  
  const settingsData = settingsRaw ? {
    socialLinks: settingsRaw.socialLinks || [],
    metadata: settingsRaw.metadata || {
      receivingEmail: "",
      logoUrl: "",
      section3dTitle: "",
      section3dDescription: "",
      section3dSubtext: "",
      scene3dFiles: [],
      missionText: ""
    }
  } : {
    socialLinks: [],
    metadata: {
      receivingEmail: "",
      logoUrl: "",
      section3dTitle: "",
      section3dDescription: "",
      section3dSubtext: "",
      scene3dFiles: [],
      missionText: ""
    }
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
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <div>
              <h2 className="text-lg font-bold">Settings</h2>
              <p className="text-sm text-muted-foreground">
                Manage social media links and website metadata.
              </p>
            </div>
            <SettingsForm initialData={settingsData} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
