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


export default function ClientDashboard () {
    return(
        <div>
            <h1>Client Dashboard</h1>
        </div>
    )
}
