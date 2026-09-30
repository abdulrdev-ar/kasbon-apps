import { LayoutDashboard, LogOut } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createClient } from "@/lib/supabase"
import { logout } from "../(auth)/actions"

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const email = data?.claims.email

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <p className="px-2 py-1.5 text-base font-semibold">Kasbon</p>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link href="/">
                    <LayoutDashboard aria-hidden />
                    Dashboard
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <p className="truncate px-2 text-xs text-muted-foreground" title={email}>
            {email}
          </p>
          <form action={logout}>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton type="submit">
                  <LogOut aria-hidden />
                  Keluar
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </form>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="my-auto h-4" />
          <h1 className="text-sm font-medium">Dashboard</h1>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
