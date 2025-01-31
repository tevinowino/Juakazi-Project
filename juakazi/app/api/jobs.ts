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

export async function action({ request }: { request: Request }): Promise<Response> {
  try {
    const formData = await request.formData();
    const actionType = formData.get("actionType") as string | null;
    
    if (!actionType) {
      throw new Error("Action type is missing.");
    }
    
    console.log({ actionType });

    const client = await clientPromise;
    const db = client.db("juakazi");
    const session = await getSession(request.headers.get("Cookie"));
    const { user } = await getUser(request);

    if (!user?.id) {
      setSuccessMessage(session, "User not found. Please log in.");
      return redirect("/dashboard");
    }

    if (actionType === "AddJob") {
      const jobTitle = formData.get("title") as string;
      const jobDescription = formData.get("description") as string;
      const jobCategory = (formData.get("category") || formData.get("customCategory")) as string;
      const jobLocation = formData.get("location") as string;
      const jobBudget = formData.get("budget") as string;

      if (!jobTitle || !jobDescription || !jobCategory || !jobLocation || !jobBudget) {
        throw new Error("Missing required job details.");
      }

      console.log({ jobTitle, jobDescription, jobCategory, jobLocation, jobBudget, actionType });

      const newJob: JobData = {
        title: jobTitle,
        description: jobDescription,
        category: jobCategory,
        location: jobLocation,
        budget: jobBudget,
        clientId: user.id,
        status: "open",
        createdAt: new Date().toISOString(),
      };

      const insertResult = await db.collection("jobs").insertOne(newJob);

      if (!insertResult.insertedId) {
        throw new Error("Failed to insert job.");
      }

      const insertedJobId = insertResult.insertedId.toString();

      await db.collection("users").updateOne(
        { supabaseId: user.id },
        { $push: { jobs: { id: insertedJobId } } }
      );

      setSuccessMessage(session, "Job created successfully!");
      return redirect("/dashboard/my-posted-jobs");
    }

    if (actionType === "DeleteJob") {
      const jobId = formData.get("jobid") as string | null;

      if (!jobId) {
        setSuccessMessage(session, "Invalid job ID.");
        return redirect("/dashboard/my-posted-jobs");
      }

      try {
        const objectId = new ObjectId(jobId);
        await db.collection("jobs").deleteOne({ _id: objectId });
        await db.collection("users").updateOne(
          { supabaseId: user.id },
          { $pull: { jobs: { id: jobId } } }
        );
        
        console.log("Job deleted successfully");
        setSuccessMessage(session, "Job deleted successfully.");
      } catch (error) {
        console.error("Delete job error:", error);
        setSuccessMessage(session, "Error deleting job.");
      }

      return redirect("/dashboard/my-posted-jobs");
    }

    throw new Error("Invalid action type.");
  } catch (error) {
    console.error("Action error:", error);
    return redirect("/dashboard");
  }
}
