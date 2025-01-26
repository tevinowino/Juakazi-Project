import { ObjectId } from "mongodb";
import { redirect } from "react-router";
import { clientPromise } from "~/db.server";
import { getSession, setSuccessMessage } from "~/session.server";
import { getUser } from "~/supabase.server";

interface JobData {
  title: string;
  description: string;
  category: string;
  location: string;
  budget: string; 
  clientId: string;
  status: "open" | "closed"; 
  createdAt: string;  
}

export async function action({ request }: { request: Request }) {
  // Get form data
  const formData = await request.formData();
  const actionType = formData.get("actionType") as string;
  console.log({ actionType });

  const client = clientPromise;
  const db = client.db("juakazi");
  const session = await getSession(request.headers.get("Cookie"));
  const { user } = await getUser(request);


  if (actionType === "AddJob") {
    const jobTitle = formData.get("title") as string;
    const jobDescription = formData.get("description") as string;
    const jobCategory = (formData.get("category") || formData.get("customCategory")) as string;
    const jobLocation = formData.get("location") as string;
    const jobBudget = formData.get("budget") as string;

    console.log({ jobTitle, jobDescription, jobCategory, jobLocation, jobBudget, actionType });

    // Get user supabase id
    const supabaseId = user?.id;

    if (!supabaseId) {
      setSuccessMessage(session, "User not found. Please log in.");
      return redirect("/dashboard");
    }

    // Insert new job into database
    const insertResult = await db.collection("jobs").insertOne({
      title: jobTitle,
      description: jobDescription,
      category: jobCategory,
      location: jobLocation,
      budget: jobBudget,
      clientId: supabaseId,
      status: "open",
      createdAt: new Date().toISOString(),
    } as JobData);

    // Get the inserted job's id
    const insertedJobId = insertResult.insertedId.toString();

    // Add the job to the user's jobs array
    await db.collection("users").updateOne(
      { supabaseId },
      { $push: { jobs: { id: insertedJobId } } } // Fixed push syntax
    );

    setSuccessMessage(session, "Job created successfully!");
    return redirect("/dashboard/my-posted-jobs");

  } else if (actionType === "DeleteJob") {
    const jobId = formData.get("jobid") as string;
    console.log({user})
    console.log({ jobId });

    if (!jobId) {
      setSuccessMessage(session, "Invalid job ID.");
      return redirect("/dashboard/my-posted-jobs");
    }

    try {
      const objectId = new ObjectId(jobId);
      await db.collection("jobs").deleteOne({ _id: objectId });
      await db.collection("users").updateOne(
        { supabaseId: user?.id },
        { $pull: { jobs: { id: jobId } } } // Fixed pull syntax
      );
      console.log("Job deleted successfully");
      setSuccessMessage(session, "Job deleted successfully.");
    } catch (error) {
      console.error("Delete job error:", error);
      setSuccessMessage(session, "Error deleting job.");
    }
    
    return redirect("/dashboard/my-posted-jobs");
  }
}
