import { Outlet, Link, useLoaderData } from "react-router";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";

export async function loader({ request }) {
  let { user } = await getUser(request);
  
  if (user) {
    let supabaseId = user.id;
    let mongoUser = await getUserData(supabaseId);
    return { user: mongoUser }; // Return user data
  }
  
  return { user: null };
}

export default function DashboardRoot() {
  const { user } = useLoaderData();

  return (
    <div className="flex">
      {/* Sidebar Navigation */}
      <nav className="w-64 min-h-screen bg-gray-800 text-white p-4">
        <h2 className="text-lg font-bold">Dashboard</h2>
        <ul className="mt-4 space-y-2">
          {user?.role === "worker" && (
            <li>
              <Link to="/dashboard/my-jobs" className="block py-2 px-4 hover:bg-gray-700">
                View Available Jobs
              </Link>
            </li>
          )}
          {user?.role === "client" && (
            <li>
              <Link to="/dashboard/add-job" className="block py-2 px-4 hover:bg-gray-700">
                Add New Job
              </Link>
              <Link to="/dashboard/my-posted-jobs" className="block py-2 px-4 hover:bg-gray-700">
                My Posted Jobs
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  );
}
