import { Outlet } from "react-router";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";

export async function loader ({request}) {
      let {user} = await getUser(request);
       // Await getUser
      console.log(user);
    
      if (user) {
        let supabaseId = user.id;
        console.log( supabaseId );
    
        let mongoUser = await getUserData(supabaseId); // Fetch user from MongoDB
        console.log(mongoUser);
        return ({ user: mongoUser }); // Return user data to the component
    
      }
    
    }
    
export default function DashboardRoot() {
    return(
        <div>
            <h1>Dashboard</h1>
            < Outlet />
        </div>
    )
}