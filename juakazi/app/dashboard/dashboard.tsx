import { useLoaderData } from "react-router";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";

export async function loader({ request }) {
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

export default function Dashboard() {
  let {user}  = useLoaderData();
  console.log({user});
  console.log(user?.phone);

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <p>Welcome, {user.fullName}</p>
      ) : (
        <p>You need to log in to access this page.</p>
      )}
    </div>
  );
}
