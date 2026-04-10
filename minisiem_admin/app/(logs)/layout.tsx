import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function LogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarTrigger />

      <SidebarInset>
        <div className="w-full">{children}</div>
      </SidebarInset>
    </>
  )
}
