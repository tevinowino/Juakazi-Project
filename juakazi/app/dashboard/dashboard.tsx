import { redirect, useLoaderData } from "react-router";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";

export async function loader({ request }) {
  let {user} = await getUser(request);
   // Await getUser
  // console.log(user);

  if (user) {
    let supabaseId = user.id;
    // console.log( supabaseId );

    let mongoUser = await getUserData(supabaseId); // Fetch user from MongoDB
    // console.log(mongoUser);
    // console.log(mongoUser?.role);

    if (mongoUser && mongoUser.role === "client") {
      return redirect("/dashboard/client-dashboard");
    } else if (mongoUser && mongoUser.role === "worker") {
      return redirect("/dashboard/worker-dashboard");
  }
}
}