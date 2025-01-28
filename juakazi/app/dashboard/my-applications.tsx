import { ObjectId } from "mongodb";
import { Form, Link, useLoaderData } from "react-router";
import { clientPromise } from "~/db.server";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";
import { format } from "date-fns";
import { getSession, setSuccessMessage } from "~/session.server";
import { 
    User, Briefcase, Mail, Phone, DollarSign, FileText, 
    Clock, CheckCircle, XCircle, MessageCircle, ExternalLink,
    ChevronDown, Search, Filter, SlidersHorizontal
  } from "lucide-react";import { useState } from "react";

// Loader function to fetch applications
export async function loader({ request }) { 
    let client = clientPromise;
    let db = client.db("juakazi");

    // Get user details
    let { user } = await getUser(request);
    let supabaseId = user?.id;
    let mongoUser = await getUserData(supabaseId);

    let jobIds = mongoUser?.jobs || []; // Ensure jobIds is an array

    let jobs = jobIds.length
        ? await db.collection("jobs").find({
              _id: { $in: jobIds.map(id => new ObjectId(id)) }
          }).toArray()
        : [];

    let allApplications = [];    

    // Fetch application details for each job
    for (let job of jobs) {
        if (job.applications && job.applications.length > 0) {
            let applicationDetails = await db.collection("applications").find({
                _id: { $in: job.applications.map(id => new ObjectId(id)) }
            }).toArray();

            // Append job name to each application
            let applicationsWithJobName = applicationDetails.map(app => ({
                ...app,
                jobName: job.title,
                applicationId: String(app._id)
            }));

            allApplications.push(...applicationsWithJobName);
        }
    }

    return { applications: allApplications };
}

// Action function to handle accept/reject
export async function action({ request }) {
    let session = await getSession(request.headers.get("Cookie"));
    let client = await clientPromise;
    let db = client.db("juakazi");

    // Get form data
    const formData = await request.formData();
    const applicationId = formData.get("applicationId");
    const actionType = formData.get("actionType");

    if (!applicationId || !actionType) return { error: "Invalid request" };

    let newStatus = actionType === "accept" ? "Accepted" : "Rejected";

    // Update application status in MongoDB
    await db.collection("applications").updateOne(
        { _id: new ObjectId(applicationId) },
        { $set: { status: newStatus } }
    );
    setSuccessMessage(session, `Application ${actionType === "accept" ? "accepted" : "rejected"} successfully`);

    return { success: true };
}

// Component to display job applications
export default function ViewApplications() {
    const { applications } = useLoaderData();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [expandedId, setExpandedId] = useState(null);
  
    const formatPhoneNumber = (phone) => {
      return phone.startsWith("07") ? "+254" + phone.slice(1) : phone;
    };
  
    const getStatusStyle = (status) => {
      const baseStyle = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-all duration-300";
      switch (status) {
        case "Accepted":
          return `${baseStyle} bg-green-100 text-green-700 border border-green-300`;
        case "Rejected":
          return `${baseStyle} bg-red-100 text-red-700 border border-red-300`;
        default:
          return `${baseStyle} bg-yellow-100 text-yellow-700 border border-yellow-300`;
      }
    };
  
    const filteredApplications = applications.filter(app => {
      const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.jobName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || app.status.toLowerCase() === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="w-8 h-8 text-blue-600" />
                  Job Applications
                </h1>
                <p className="mt-1 text-gray-500">
                  Track and manage your candidate applications
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="text-blue-700 font-semibold">
                    {filteredApplications.length} Applications
                  </span>
                </div>
              </div>
            </div>
  
            {/* Search and Filter Section */}
            <div className="mt-6 flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
  
          {/* Applications Grid */}
          {filteredApplications.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredApplications.map((application) => (
                <div
                  key={application._id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6 space-y-6">
                    {/* Header */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <h2 className="text-xl font-semibold text-gray-900">
                            {application.fullName}
                          </h2>
                        </div>
                        <span className={getStatusStyle(application.status)}>
                          {application.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-lg">
                        <Briefcase className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">{application.jobName}</span>
                      </div>
                    </div>
  
                    {/* Details Section */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{application.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{formatPhoneNumber(application.phone)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <DollarSign className="w-4 h-4" />
                          <span>KES {application.expectedPay}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>{format(new Date(application.appliedAt), "PPpp")}</span>
                        </div>
                      </div>
  
                      {/* Expandable Cover Letter */}
                      <div className="space-y-2">
                        <button
                          onClick={() => setExpandedId(expandedId === application._id ? null : application._id)}
                          className="w-full flex items-center justify-between text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">Cover Letter</span>
                          </div>
                          <ChevronDown 
                            className={`w-4 h-4 transition-transform duration-300 ${
                              expandedId === application._id ? 'rotate-180' : ''
                            }`}
                          />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${
                          expandedId === application._id ? 'max-h-96' : 'max-h-0'
                        }`}>
                          <p className="text-gray-600 text-sm bg-gray-50 p-4 rounded-lg">
                            {application.coverLetter}
                          </p>
                        </div>
                      </div>
                    </div>
  
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 pt-4 border-t">
                      <Form method="post" className="contents">
                        <input type="hidden" name="applicationId" value={application.applicationId} />
                        <input type="hidden" name="actionType" value="accept" />
                        <button 
                          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                          type="submit"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accept
                        </button>
                      </Form>
                      <Form method="post" className="contents">
                        <input type="hidden" name="applicationId" value={application.applicationId} />
                        <input type="hidden" name="actionType" value="reject" />
                        <button 
                          className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                          type="submit"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </Form>
                      {application.status === "Accepted" && (
                        <a
                          href={`https://wa.me/${formatPhoneNumber(application.phone)}?text=Hello%20${encodeURIComponent(application.fullName)},%20I'm%20interested%20in%20discussing%20your%20job%20application.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          <MessageCircle className="w-4 h-4" />
                          WhatsApp
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center">
              <div className="rounded-full bg-blue-100 p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900">No applications found</h3>
              <p className="mt-2 text-gray-500">
                {searchTerm || selectedStatus !== "all" 
                  ? "Try adjusting your search or filters"
                  : "Applications will appear here once candidates apply for your jobs"}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }