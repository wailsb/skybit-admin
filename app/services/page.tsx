import { AppSidebar } from "@/components/app-sidebar";
import { SidebarHeader, SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ServiceInterface } from "../Types";
import { CardImage } from "@/components/ui/CardImage";

import data from "./data.json"

export default function ServicesPage() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />

      <SidebarInset>
        <SidebarHeader/>
        {/* list of services */}
        <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Services</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data.map((service) => (
                    <CardImage
                        key={service.id}
                        id={service.id}
                        title={service.title}
                        description={service.description}
                        imageUrl={service.ImageUrl}
                        linkTo={service.linkto}

                        badgeText={service.id === "3" ? "Featured" : undefined}
                    />
                ))}
            </ul>
        </div>
      </SidebarInset>

    </SidebarProvider>
  );
}