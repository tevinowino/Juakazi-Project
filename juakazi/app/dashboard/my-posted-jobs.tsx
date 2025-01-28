import { useState } from "react";
import { Form, redirect, useLoaderData } from "react-router";
import type { LoaderFunction, ActionFunction } from "react-router";
import {
  Briefcase, MapPin, DollarSign,
  Tag, Edit, Trash2, X, AlertCircle,
  ChevronUp, ChevronDown, Clock
} from "lucide-react";
import { commitSession, getSession, setSuccessMessage } from "~/session.server";
import { ObjectId } from "mongodb";
import { getUser } from "~/supabase.server";
import { clientPromise } from "~/db.server";

interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  createdAt: string;
}

interface JobFromDB {
  _id: ObjectId;
  title: string;
  description: string;
  category: string;
  location: string;
  budget: number;
  createdAt: string;
  clientId: string;
}

interface LoaderData {
  jobs: Job[];
  error?: string;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const session = await getSession(request.headers.get("Cookie"));
    const { user } = await getUser(request);

    if (!user) return redirect("/login?error=Unauthorized");

    const client = await clientPromise;
    const db = client.db("juakazi");

    const jobsfromdb = await db.collection<JobFromDB>("jobs").find({ clientId: user.id }).toArray();

    const jobs = jobsfromdb.map((job) => ({
      id: String(job._id),
      title: job.title,
      description: job.description,
      category: job.category,
      location: job.location,
      budget: job.budget,
      createdAt: job.createdAt,
    }));

    return { jobs };
  } catch (error) {
    console.error("Error loading jobs:", error);
    return { jobs: [], error: "Failed to load jobs. Try again later." };
  }
};

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const { user } = await getUser(request);
  if (!user) return redirect("/login?error=Unauthorized");

  const formData = await request.formData();
  const actionType = formData.get("actionType") as string | null;
  const jobId = formData.get("jobId") as string | null;

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
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        location: formData.get("location") as string,
        budget: Number(formData.get("budget")),
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
};

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
}

const JobCard = ({ job, onEdit }: JobCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 transform transition-all duration-300 group-hover:h-full group-hover:w-full group-hover:opacity-5"></div>
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <Briefcase className="text-blue-500" size={24} />
            {job.title}
          </h3>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-blue-500 transition-colors"
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        <div className="space-y-3 text-gray-600">
          <div className="flex items-center gap-2">
            <Tag className="text-emerald-500" size={18} />
            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-sm">
              {job.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="text-red-500" size={18} />
            <span>{job.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <DollarSign className="text-purple-500" size={18} />
            <span className="font-semibold">${job.budget}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="text-orange-500" size={18} />
            <span className="text-sm">{new Date(job.createdAt).toLocaleString()}</span>
          </div>
        </div>

        <div className={`mt-4 transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
          <p className="text-gray-600">{job.description}</p>
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={() => onEdit(job)}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
          >
            <Edit size={18} />
            <span>Edit</span>
          </button>

          <Form method="post" className="inline">
            <input type="hidden" name="actionType" value="delete" />
            <input type="hidden" name="jobId" value={job.id} />
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <Trash2 size={18} />
              <span>Delete</span>
            </button>
          </Form>
        </div>
      </div>
    </div>
  );
};

interface EditModalProps {
  job: Job;
  onClose: () => void;
}

const EditModal = ({ job, onClose }: EditModalProps) => (
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-xl p-8 w-full max-w-md relative animate-slideUp">
      <button
      title="Close"
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X size={24} />
      </button>

      <h2 className="text-2xl font-bold mb-6 text-gray-800">Update Job</h2>

      <Form method="post" className="space-y-4">
        <input type="hidden" name="actionType" value="update" />
        <input type="hidden" name="jobId" value={job.id} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
          <input
          placeholder="Job Title"
            type="text"
            name="title"
            defaultValue={job.title}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            placeholder="Description"
            name="description"
            defaultValue={job.description}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            rows={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <input
              placeholder="Category"
              type="text"
              name="category"
              defaultValue={job.category}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              placeholder="Location"
              type="text"
              name="location"
              defaultValue={job.location}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
          <input
            placeholder="Budget"
            type="number"
            name="budget"
            defaultValue={job.budget}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 mt-6"
        >
          Update Job
        </button>
      </Form>
    </div>
  </div>
);

export default function MyPostedJobs() {
  const { jobs, error } = useLoaderData() as LoaderData;
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-8">My Posted Jobs</h1>

      {error && (
        <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-center gap-2">
          <AlertCircle size={20} />
          <p>{error}</p>
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No jobs posted yet.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onEdit={setEditingJob} />
          ))}
        </div>
      )}

      {editingJob && <EditModal job={editingJob} onClose={() => setEditingJob(null)} />}
    </div>
  );
}