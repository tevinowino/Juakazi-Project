import { useState } from "react";
import { Form, useLoaderData } from "react-router";
import { clientPromise } from "~/db.server";
import { getSession, setSuccessMessage, commitSession } from "~/session.server";
import { getUser } from "~/supabase.server";
import { redirect } from "react-router";
import { ObjectId } from "mongodb";
import { Briefcase, MapPin, Calendar, DollarSign, Tag, Edit, Trash2, X } from "lucide-react";

// 🔥 Loader Function - Fetch User Jobs
export async function loader({ request }) {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const { user } = await getUser(request);

    if (!user) return redirect("/login?error=Unauthorized");

    const client = await clientPromise;
    const db = client.db("juakazi");

    const jobsfromdb = await db.collection("jobs").find({ clientId: user.id }).toArray();
    
    const jobs = jobsfromdb.map((job) => ({
      id: String(job._id),
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      budget: job.budget,
      createdAt: job.createdAt,
    }));
    console.log(jobs);
    return { jobs };
  } catch (error) {
    console.error("Error loading jobs:", error);
    return { jobs: [], error: "Failed to load jobs. Try again later." };
  }
}

// 🚀 Action Function - Handle Updates & Deletes
export async function action({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  const { user } = await getUser(request);
  if (!user) return redirect("/login?error=Unauthorized");

  const formData = await request.formData();
  const actionType = formData.get("actionType");
  const jobId = formData.get("jobId")?.trim();

  if (!actionType || !jobId || !ObjectId.isValid(jobId)) {
    setSuccessMessage(session, "Invalid request. Missing or incorrect Job ID.");
    const headers = new Headers({ "Set-Cookie": await commitSession(session) });
    return redirect("/dashboard/my-posted-jobs", { headers });
  }

  const client = await clientPromise;
  const db = client.db("juakazi");

  try {
    if (actionType === "update") {
      const updatedJob = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        location: formData.get("location"),
        budget: formData.get("budget"),
      };

      await db.collection("jobs").updateOne(
        { _id: new ObjectId(jobId), clientId: user.id },
        { $set: updatedJob }
      );

      setSuccessMessage(session, "Job updated successfully.");
    } else if (actionType === "delete") {
      await db.collection("jobs").deleteOne({ _id: new ObjectId(jobId), clientId: user.id });
      setSuccessMessage(session, "Job deleted successfully.");
    } else {
      setSuccessMessage(session, "Invalid action.");
    }
  } catch (error) {
    console.error("Action error:", error);
    setSuccessMessage(session, "Something went wrong. Try again.");
  }

  const headers = new Headers({ "Set-Cookie": await commitSession(session) });
  return redirect("/dashboard/my-posted-jobs", { headers });
}

// 🎨 UI Component - Display Jobs & Forms
export default function MyPostedJobs() {
  const { jobs, error } = useLoaderData();
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleEdit = (job) => {
    setEditingJob(job);
    setFormData(job);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Posted Jobs</h1>

      {error && <p className="text-red-600">{error}</p>}

      {jobs.length === 0 ? (
        <div className="text-center text-gray-500">No jobs posted yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md p-6 relative">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="mr-3 text-blue-500" size={24} /> {job.title}
              </h3>
              <div className="space-y-3 text-gray-600">
                <p className="flex items-center"><Tag className="mr-3 text-green-500" size={20} /> {job.category}</p>
                <p className="flex items-center"><MapPin className="mr-3 text-red-500" size={20} /> {job.location}</p>
                <p className="flex items-center"><DollarSign className="mr-3 text-purple-500" size={20} /> ${job.budget}</p>
                <p className="flex items-center"><Calendar className="mr-3 text-orange-500" size={20} /> {new Date(job.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex justify-between mt-4">
                <button onClick={() => handleEdit(job)} className="text-blue-600 hover:text-blue-800 flex items-center">
                  <Edit size={20} className="mr-2" /> Edit
                </button>
                <Form method="post">
                  <input type="hidden" name="actionType" value="delete" />
                  <input type="hidden" name="jobId" value={job.id} />
                  <button type="submit" className="text-red-600 hover:text-red-800 flex items-center">
                    <Trash2 size={20} className="mr-2" /> Delete
                  </button>
                </Form>
              </div>
            </div>
          ))}
        </div>
      )}
      {editingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md relative">
            <button onClick={() => setEditingJob(null)} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800">
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6">Update Job</h2>
            <Form method="post">
              <input type="hidden" name="actionType" value="update" />
              <input type="hidden" name="jobId" value={editingJob.id} />
              <input type="text" name="title" defaultValue={editingJob.title} className="w-full p-2 border rounded" placeholder="Job Title" required />
              <textarea name="description" defaultValue={editingJob.description} className="w-full p-2 border rounded" placeholder="Job Description" rows="4" required />
              <input type="text" name="category" defaultValue={editingJob.category} className="w-full p-2 border rounded" placeholder="Category" required />
              <input type="text" name="location" defaultValue={editingJob.location} className="w-full p-2 border rounded" placeholder="Location" required />
              <input type="number" name="budget" defaultValue={editingJob.budget} className="w-full p-2 border rounded" placeholder="Budget" required />

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                Update Job
              </button>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}