import { useState } from "react";
import {
  MapPin, Tag, DollarSign, Calendar, Search, X, Filter,
  ChevronDown, Briefcase, Clock, ArrowUpRight, Sparkles
} from "lucide-react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { getUser } from "~/supabase.server";
import { getUserData } from "~/hooks/getUserData";
import { clientPromise } from "~/db.server";

export async function loader({ request }) {
  let { user } = await getUser(request);
  let supabaseId = user?.id;
  let mongoUser = await getUserData(supabaseId);
  let userRole = mongoUser?.role;
  const client = clientPromise;
  const db = client.db("juakazi");
  const jobsArray = await db.collection("jobs").find().toArray();

  const jobs = jobsArray.map((job) => ({
    ...job,
    jobId: String(job._id),
  }));
  return { jobs, userRole };
}


export default function AllJobs() {
  const { jobs, userRole } = useLoaderData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [hoveredJob, setHoveredJob] = useState(null);

  const categories = [...new Set(jobs.map((job) => job.category))];
  const locations = [...new Set(jobs.map((job) => job.location))];

  const selectedCategory = searchParams.get("category") || "";
  const selectedLocation = searchParams.get("location") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";

  const filteredJobs = jobs.filter((job) => {
    const price = Number(job.budget) || 0;
    const matchesSearch = searchTerm === "" ||
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch &&
      (selectedCategory ? job.category === selectedCategory : true) &&
      (selectedLocation ? job.location === selectedLocation : true) &&
      (minPrice ? price >= Number(minPrice) : true) &&
      (maxPrice ? price <= Number(maxPrice) : true);
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
    setIsFiltersOpen(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative bg-white rounded-3xl p-8 shadow-lg">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-50 rounded-r-3xl opacity-50" />
          <div className="relative flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
                Job Listings
              </h1>
              <p className="text-gray-600">Find your next opportunity</p>
            </div>
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="group flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-xl hover:bg-blue-100 transition-all duration-300"
            >
              <Filter className="w-5 h-5 text-blue-600 group-hover:rotate-180 transition-transform duration-300" />
              <span className="text-blue-600 font-medium">Filters</span>
              <ChevronDown
                className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${
                  isFiltersOpen ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        {isFiltersOpen && (
          <div className="bg-white rounded-2xl shadow-lg p-6 animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none"
                />
              </div>

              <select
                className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none cursor-pointer"
                value={selectedCategory}
                onChange={(e) => updateFilter("category", e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                className="w-full p-3 border-2 border-gray-200 rounded-xl bg-white hover:border-blue-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 outline-none cursor-pointer"
                value={selectedLocation}
                onChange={(e) => updateFilter("location", e.target.value)}
              >
                <option value="">All Locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>

              {(selectedCategory || selectedLocation || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 bg-red-100 text-red-600 px-6 py-3 rounded-xl hover:bg-red-200 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                  <span className="font-medium">Clear Filters</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Job Listings */}
        {filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id.toString()}
                onClick={() => setSelectedJob(job)}
                onMouseEnter={() => setHoveredJob(job._id)}
                onMouseLeave={() => setHoveredJob(null)}
                className="group relative bg-white border-2 border-gray-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 truncate flex-1">
                      {job.title}
                    </h2>
                    <ArrowUpRight className={`w-5 h-5 text-blue-500 transform transition-transform duration-300 ${
                      hoveredJob === job._id ? 'translate-x-1 -translate-y-1' : ''
                    }`} />
                  </div>

                  <p className="text-gray-600 line-clamp-3">{job.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-blue-500" />
                      <span className="text-sm text-gray-700">{job.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-500" />
                      <span className="text-sm text-gray-700">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-purple-500" />
                      <span className="text-sm text-gray-700">
                        Ksh {Number(job.budget).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-orange-500" />
                      <span className="text-sm text-gray-700">
                        Posted {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors duration-300">
                      <Sparkles className="w-4 h-4" />
                      View Details
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-white rounded-2xl shadow-lg">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-2xl text-gray-500 font-semibold">
              No jobs found matching your criteria
            </p>
            <p className="text-gray-400 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}

        {/* Job Details Modal */}
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full mx-auto overflow-hidden shadow-2xl animate-slideUp">
              <div className="relative p-8 bg-gradient-to-r from-blue-50 to-purple-50">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  {selectedJob.title}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Tag className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Category</p>
                      <p className="font-medium text-gray-900">
                        {selectedJob.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <MapPin className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">
                        {selectedJob.location}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Budget</p>
                      <p className="font-medium text-gray-900">
                        Ksh {Number(selectedJob.budget).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 rounded-lg">
                      <Calendar className="w-6 h-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Posted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedJob.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-0 flex gap-4">
                {userRole === "worker" ? (
                  <Link
                    to={`/apply/${String(selectedJob.jobId)}`}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-semibold text-center transition-all duration-300"
                  >
                    Apply Now
                  </Link>
                ) : (
                  <p className="text-red-600 text-center font-semibold w-full">
                    {userRole
                      ? "Only workers can apply for jobs."
                      : "Please log in or sign up to apply."}
                  </p>
                )}
                <button
                  onClick={() => setSelectedJob(null)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
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