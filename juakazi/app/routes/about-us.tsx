import { Briefcase, Users, Target, Globe } from "lucide-react";

export default function AboutUs() {
  return (
    <div className="max-w-5xl mx-auto py-16 px-6 text-gray-800">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">About JuaKazi</h1>
      <p className="text-lg text-center max-w-3xl mx-auto mb-12">
        JuaKazi is a platform dedicated to connecting skilled workers with people
        who need their services. Whether you're looking for a plumber, an
        electrician, or a handyman, JuaKazi makes it easy to find and hire
        trusted professionals.
      </p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <Briefcase className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Empowering Workers</h2>
          <p className="text-gray-600">
            We provide a platform for skilled workers to showcase their talents
            and find job opportunities.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Community Driven</h2>
          <p className="text-gray-600">
            JuaKazi fosters a community of trust, helping people find reliable
            and professional workers.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Our Mission</h2>
          <p className="text-gray-600">
            To bridge the gap between workers and clients, ensuring seamless
            service delivery and fair wages.
          </p>
        </div>

        <div className="p-6 bg-white rounded-2xl shadow-md hover:shadow-lg transition">
          <Globe className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Future Growth</h2>
          <p className="text-gray-600">
            We envision expanding our reach, bringing JuaKazi’s benefits to
            communities nationwide.
          </p>
        </div>
      </div>
    </div>
  );
}
