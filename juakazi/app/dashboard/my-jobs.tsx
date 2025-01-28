import { ObjectId } from "mongodb";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { clientPromise } from "~/db.server";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";
import { 
    Building, 
    Calendar, 
    Clock, 
    AlertCircle, 
    Loader2, 
    XCircle,
    CheckCircle,
    HourglassIcon
  } from "lucide-react";

export async function loader({ request }) {
    const client = await clientPromise;
    const db = client.db("juakazi");

    const { user } = await getUser(request);
    if (!user?.id) {
        console.error("User not found. Please log in.");
    }

    // Fetch MongoDB user details
    const mongoUser = await getUserData(user?.id);
    if (!mongoUser) {
        console.error("User not found in the database.");}

    let workerId = String(mongoUser._id);

    // Retrieve applications for this worker
    const applications = await db.collection("applications")
        .find({ applicantId: workerId })
        .toArray();

    // Fetch job details for each application
    const applicationsWithJobs = await Promise.all(
        applications.map(async (app) => {
            const job = await db.collection("jobs").findOne({ _id: new ObjectId(app.jobId) });
            return {
                ...app,
                jobTitle: job?.title || "Job Not Found",
                jobCompany: job?.company || "Unknown Company",
                applicationId: String(app._id),
            };
        })
    );

    return ({ applications: applicationsWithJobs });
}

export async function action({ request }) {
    const formData = await request.formData();
    const applicationId = formData.get("applicationId");

    const client = await clientPromise;
    const db = client.db("juakazi");

    const { user } = await getUser(request);
    if (!user?.id) {
        console.error("User not found. Please log in.");
    }

    const mongoUser = await getUserData(user.id);
    if (!mongoUser) {
        console.error("User not found in the database.");
    }

    let workerId = String(mongoUser?._id);
    console.log({workerId});
    console.log({applicationId});

    try {
        // Find application details
        const application = await db.collection("applications").findOne({ _id: new ObjectId(applicationId) });

        if (!application) {
            console.error("Application not found.");
        }

        const jobId = application?.jobId;

        // Remove application from the worker's applications array
        await db.collection("users").updateOne(
            { _id: new ObjectId(workerId) },
            { $pull: { applications: applicationId } }
        );

        // Remove application from the job's applications array
        await db.collection("jobs").updateOne(
            { _id: new ObjectId(jobId) },
            { $pull: { applications: applicationId } }
        );

        // Delete the application itself
        await db.collection("applications").deleteOne({ _id: new ObjectId(applicationId) });

        return redirect("/dashboard/my-jobs");
    } catch (error) {
        console.error("Error withdrawing application:", error);
        return redirect("/dashboard/my-jobs");  
    }
}

export default function WorkerApplications() {
    const { applications } = useLoaderData();
    const fetcher = useFetcher();
  
    const getStatusBadge = (status) => {
      const statusConfig = {
        pending: {
          icon: HourglassIcon,
          color: "bg-yellow-100 text-yellow-800",
          label: "Pending Review"
        },
        accepted: {
          icon: CheckCircle,
          color: "bg-green-100 text-green-800",
          label: "Accepted"
        },
        rejected: {
          icon: XCircle,
          color: "bg-red-100 text-red-800",
          label: "Rejected"
        }
      };
  
      const config = statusConfig[status.toLowerCase()] || statusConfig.pending;
      const Icon = config.icon;
  
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${config.color}`}>
          <Icon className="w-4 h-4 mr-1" />
          {config.label}
        </span>
      );
    };
  
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage your job applications
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm">
            <span className="text-sm font-medium text-gray-600">Total Applications:</span>
            <span className="ml-2 text-lg font-semibold text-gray-900">{applications.length}</span>
          </div>
        </div>
  
        {applications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applications</h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't applied to any jobs yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div 
                key={app._id} 
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {app.jobTitle}
                      </h2>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Building className="w-4 h-4 mr-2" />
                          {app.jobCompany}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="w-4 h-4 mr-2" />
                          Applied on {new Date(app.appliedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="w-4 h-4 mr-2" />
                          {Math.floor((new Date() - new Date(app.appliedAt)) / (1000 * 60 * 60 * 24))} days ago
                        </div>
                      </div>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex-1">
                      {app.status === 'pending' && (
                        <p className="text-sm text-gray-500">
                          Your application is under review. We'll notify you of any updates.
                        </p>
                      )}
                    </div>
                    <fetcher.Form method="post">
                      <input type="hidden" name="applicationId" value={app.applicationId} />
                      <button
                        type="submit"
                        disabled={fetcher.state !== "idle"}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {fetcher.state !== "idle" ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Withdrawing...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Withdraw Application
                          </>
                        )}
                      </button>
                    </fetcher.Form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }