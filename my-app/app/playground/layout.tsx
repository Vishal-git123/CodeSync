import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlaygroundForUser } from "@/modules/auth/dashboard/actions";
import { DashboardSidebar } from "@/modules/auth/dashboard/components/dashboard-sidebar";

export default async function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgroundData = await getAllPlaygroundForUser();

  const technologyIconMap: Record<string, string> = {
    REACT: "Zap",
    NEXTJS: "Lightbulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formattedPlaygroundData =
    playgroundData?.map((item) => ({
      id: item.id,
      name: item.title,
      starred: item.starMarks?.[0]?.isMarked ?? false,
      icon: technologyIconMap[item.template] || "Code2",
    })) ?? [];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DashboardSidebar initialPlaygroundData={formattedPlaygroundData} />

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
