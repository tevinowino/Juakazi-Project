import { Outlet, Link, useLoaderData, Form, useLocation } from "react-router";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";
import { useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  ClipboardList,
  Users,
  ChevronLeft,
  LogOut,
  Menu,
  User,
} from "lucide-react";

export async function loader({ request }: { request: Request }) {
  let { user } = await getUser(request);

  if (user) {
    let supabaseId = user.id;
    let mongoUser = await getUserData(supabaseId);
    return { user: mongoUser };
  }

  return { user: null };
}

export default function DashboardRoot() {
  const { user } = useLoaderData();
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const workerLinks = [
    { to: "/dashboard", icon: User, label: "Profile" },
    { to: "/dashboard/my-jobs", icon: Briefcase, label: "View Available Jobs" },
  ];

  const clientLinks = [
    { to: "/dashboard", icon: User, label: "Profile" },
    { to: "/dashboard/add-job", icon: PlusCircle, label: "Add New Job" },
    { to: "/dashboard/my-posted-jobs", icon: ClipboardList, label: "My Posted Jobs" },
    { to: "/dashboard/my-applications", icon: Users, label: "View Applications" },
  ];

  const navigationLinks = user?.role === "worker" ? workerLinks : clientLinks;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          title="Toggle Sidebar"
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 transform ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 transition-transform duration-200 ease-in-out ${isSidebarCollapsed ? 'w-20' : 'w-64'} 
        bg-gray-800 p-4 flex flex-col`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
            {!isSidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-medium text-white truncate">{user?.fullName}</h2>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
          <button
            title="Toggle Sidebar"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="hidden lg:block p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600"
          >
            <ChevronLeft
              className={`w-5 h-5 text-gray-300 transform transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        <nav className="space-y-1">
          <div className="px-3 py-2">
            <div className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300">
              <LayoutDashboard className="w-5 h-5" />
              {!isSidebarCollapsed && <span>Dashboard</span>}
            </div>
          </div>

          {navigationLinks.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive ? "bg-blue-700 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                {!isSidebarCollapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-8">
          <Link
            to="/logout"
            className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
          >
            {!isSidebarCollapsed && (
              <span>
                <Form method="post" action="/logout">
                  <button className="text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition flex items-center gap-2">
                    <LogOut className="w-5 h-5" />
                    Logout
                  </button>
                </Form>
              </span>
            )}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-200 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} pt-16 lg:pt-0`}>
        <div className="container mx-auto px-4 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
