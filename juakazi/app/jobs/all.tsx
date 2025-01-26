import { useState } from "react";
import {
  MapPin,
  Tag,
  DollarSign,
  Calendar,
  Filter,
  Search,
  X
} from "lucide-react";
import { clientPromise } from "~/db.server";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { getUser } from "~/supabase.server";
import { getUserData } from "~/hooks/getUserData";

export async function loader({ request }) {
  let { user } = await getUser(request);
  let supabaseId = user?.id
  let mongoUser = await getUserData(supabaseId);
  let userRole = mongoUser?.role
  const client = clientPromise;
  const db = client.db("juakazi");
  const jobsArray = await db.collection("jobs").find().toArray();

  const jobs = jobsArray.map((job) => ({
    ...job,
    jobId: String(job._id),
  }));
  console.log(jobs);
  return { jobs, userRole };
}

export default function AllJobs() {
  const { jobs, userRole } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Unique categories and locations
  const categories = [...new Set(jobs.map((job) => job.category))];
  const locations = [...new Set(jobs.map((job) => job.location))];

  // Filters from URL params
  const selectedCategory = searchParams.get("category") || "";
  const selectedLocation = searchParams.get("location") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  // Filter and search jobs
  const filteredJobs = jobs.filter((job) => {
    const price = Number(job.budget) || 0;
    const matchesSearch = searchTerm === "" || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return (
      matchesSearch &&
      (selectedCategory ? job.category === selectedCategory : true) &&
      (selectedLocation ? job.location === selectedLocation : true) &&
      (minPrice ? price >= Number(minPrice) : true) &&
      (maxPrice ? price <= Number(maxPrice) : true)
    );
  });

  function updateFilter(key, value) {
    const newParams = new URLSearchParams(searchParams);
    if (value) newParams.set(key, value);
    else newParams.delete(key);
    setSearchParams(newParams);
  }

  function clearFilters() {
    setSearchParams(new URLSearchParams());
    setSearchTerm("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filters Section */}
        <div className="bg-white shadow-xl rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="relative flex-grow w-full">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Category Filter */}
            <select
              className="w-full md:w-auto p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition"
              value={selectedCategory}
              onChange={(e) => updateFilter("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Location Filter */}
            <select
              className="w-full md:w-auto p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 transition"
              value={selectedLocation}
              onChange={(e) => updateFilter("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((location) => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>

            {/* Clear Filters Button */}
            {(selectedCategory || selectedLocation || searchTerm) && (
              <button 
                onClick={clearFilters}
                className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Job Listings */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id.toString()}
                onClick={() => setSelectedJob(job)}
                className="bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-3 truncate">{job.title}</h2>
                  <p className="text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                  <div className="space-y-3 mb-4 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-blue-500" />
                      <span className="text-sm">{job.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <span className="text-sm">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-500" />
                      <span className="text-sm">Ksh {Number(job.budget).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm">{new Date(job.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="mt-4 text-center">
                    <span className="px-3 py-1 rounded-full text-sm font-semibold 
                      bg-blue-100 text-blue-800 hover:bg-blue-200 transition">
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white rounded-2xl shadow-lg">
            <p className="text-2xl text-gray-500 font-semibold">
              No jobs found matching your search and filters.
            </p>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full mx-auto overflow-hidden shadow-2xl">
              <div className="p-6 bg-blue-50">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedJob.title}</h2>
                <p className="text-gray-600">{selectedJob.description}</p>
              </div>
              
              <div className="p-6 grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Tag className="w-6 h-6 text-blue-500" />
                    <span><strong>Category:</strong> {selectedJob.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-green-500" />
                    <span><strong>Location:</strong> {selectedJob.location}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-6 h-6 text-purple-500" />
                    <span><strong>Budget:</strong> Ksh {Number(selectedJob.budget).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-orange-500" />
                    <span><strong>Posted:</strong> {new Date(selectedJob.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 flex gap-4">
                {userRole === "worker" ? (
                  <Link to={`/apply/${String(selectedJob.jobId)}`} className="flex-grow bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition">
                    Apply Now
                  </Link>
                ) : (
                  <p className="text-red-600 text-center font-semibold w-full">
                    {userRole ? "Only workers can apply for jobs." : "Please log in or sign up to apply."}
                  </p>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-grow bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

