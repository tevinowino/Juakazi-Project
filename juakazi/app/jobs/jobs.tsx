import { Outlet } from "react-router";

export default function JobsList() {
    return (
        <div>
            <h1 className="text-4xl font-bold mb-4 mt-4 text-center text-blue-600">View all posted jobs</h1>
            < Outlet />
        </div>    
    )
}