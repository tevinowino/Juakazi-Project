import { clientPromise } from "~/db.server";

export async function getUserData(supabaseId: string) {
    // Connect to MongoDB
    let client = await clientPromise; // Ensure we wait for the client
    let db = client.db("juakazi");

    // Find user by supabaseId
    let user = await db.collection("users").findOne({ supabaseId }); // Await the result
    
    return user;
}
