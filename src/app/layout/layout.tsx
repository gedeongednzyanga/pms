import { useState } from "react";
import { Outlet } from "react-router";

import { AppSidebar } from "../../components/menu/app-side-bar";
import TopMenu from "../../components/menu/top-menu";

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* Sidebar */}
      {sidebarOpen && <AppSidebar />}

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">

        <TopMenu
          onToggleSidebar={() =>
            setSidebarOpen((value) => !value)
          }
        />

        <main className="min-h-0 flex-1 overflow-auto p-5">
          <Outlet />
        </main>

      </div>
    </div>
  );
}