import { ObjectId } from "mongodb";
import { redirect } from "react-router";
import { clientPromise } from "~/db.server";
import { getUserData } from "~/hooks/getUserData";
import { getSession, setSuccessMessage } from "~/session.server";
import { getUser } from "~/supabase.server";

export async function action({ request }: { request: Request }) {
    const formData = await request.formData();
    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const expectedPay = formData.get("expectedPay") as string;
    const coverLetter = formData.get("coverLetter") as string;
    const jobId = formData.get("jobId") as string;

    const client = await clientPromise;
    const db = client.db("juakazi");
    const session = await getSession(request.headers.get("Cookie"));
    const { user } = await getUser(request);

    if (!user?.id) {
        setSuccessMessage(session, "User not found. Please log in.");
        return redirect("/dashboard");
    }

    // Fetch MongoDB user details
    let supabaseId = user.id;
    const mongoUser = await getUserData(supabaseId);
    if (!mongoUser) {
        setSuccessMessage(session, "User not found in the database.");
        return redirect("/dashboard");
    }

    let workerId = String(mongoUser._id);
    console.log({ workerId });

    // Insert new application into the database
    const application = {
        jobId,
        applicantId: workerId,
        fullName,
        email,
        phone,
        expectedPay,
        coverLetter,
        status: "Pending...",
        appliedAt: new Date().toISOString(),
    };

    try {
        // Insert application
        const insertResult = await db.collection("applications").insertOne(application);
        const applicationId = insertResult.insertedId.toString();

        // Add application ID to the specific job's applications array
        await db.collection("jobs").updateOne(
            { _id: new ObjectId(jobId) },
            { $push: { applications: applicationId } }
        );

        // Add application ID to the applicant's applications array
        await db.collection("users").updateOne(
            { _id: new ObjectId(workerId) },  // Fix: Using workerId instead of user.id
            { $push: { applications: applicationId } }
        );

        setSuccessMessage(session, "Application submitted successfully!");
        return redirect('/jobs');
    } catch (error) {
        console.error("Error submitting application:", error);
        setSuccessMessage(session, "Error submitting application.");
        return redirect("/jobs");
    }
}
