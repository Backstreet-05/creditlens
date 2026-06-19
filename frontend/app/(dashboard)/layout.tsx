import { cookies } from "next/headers";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DemoModeBanner from "@/components/shared/DemoModeBanner";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isDemo = cookieStore.get("cri_demo_mode")?.value === "true";

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isDemo={isDemo} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {isDemo && <DemoModeBanner />}
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
