import { Outlet } from "react-router";
import { Sidebar } from "~/routes/dashboard/components/sidebar";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-app-gray-300">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
}
