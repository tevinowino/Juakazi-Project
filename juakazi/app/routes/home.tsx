import {
  CheckCircle, Search, Star, ShieldCheck,
  MessageCircle, Globe, Award, HeartIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-green-50 text-gray-900 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-green-500 text-white">
        <div className="container mx-auto px-6 py-20 grid md:grid-cols-2 items-center gap-12">
          {/* Left Content */}
          <div className="z-10">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Your Local <span className="text-yellow-300">Workforce</span> Solution
            </motion.h1>
            <p className="text-xl mb-8 pr-8">
              Instantly connect with skilled professionals. From home repairs to business services, we've got you covered.
            </p>
            <motion.div
              className="flex space-x-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/jobs"
                className="px-8 py-4 bg-yellow-400 text-black rounded-full font-bold hover:bg-yellow-500 transition transform hover:scale-105"
              >
                Find Work
              </Link>
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-blue-600 rounded-full font-bold hover:bg-gray-100 transition transform hover:scale-105"
              >
                Join JuaKazi
              </Link>
            </motion.div>
          </div>

          {/* Right Image */}
          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://juakali.co/front/img/bg.png"
              alt="JuaKazi Workforce"
              className=""
            />
          </motion.div>
        </div>
      </section>
      {/* Features Section */}
      <section className="container mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={Globe}
            title="Nationwide Coverage"
            description="Connect with professionals across multiple regions and sectors."
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Verified Professionals"
            description="Every worker undergoes thorough background and skill verification."
          />
          <FeatureCard
            icon={Award}
            title="Quality Guaranteed"
            description="We ensure top-tier service quality with our rigorous screening process."
          />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Your Path to Perfect Service</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <WorkStep
              icon={Search}
              title="Browse"
              description="Explore skilled professionals tailored to your needs."
            />
            <WorkStep
              icon={MessageCircle}
              title="Connect"
              description="Discuss project details directly with potential workers."
            />
            <WorkStep
              icon={CheckCircle}
              title="Hire"
              description="Make secure payments after successful job completion."
            />
          </div>
        </div>
      </section>
      <section className="bg-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Why Choose JuaKazi?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <CheckCircle size={48} className="text-green-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Reliability</h3>
              <p className="text-gray-600">We only work with verified professionals who meet high-quality standards.</p>
            </div>
            <div className="flex flex-col items-center">
              <HeartIcon size={48} className="text-pink-500 mb-6" />
              <h3 className="text-2xl font-bold mb-4">Customer Care</h3>
              <p className="text-gray-600">Our support team is always available to assist with any issues you encounter.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-blue-50 to-green-50 py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">By the Numbers</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <motion.div
                className="text-5xl font-extrabold text-yellow-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                500+
              </motion.div>
              <p className="text-xl text-gray-700">Workers Connected</p>
            </div>
            <div className="flex flex-col items-center">
              <motion.div
                className="text-5xl font-extrabold text-yellow-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                1,000+
              </motion.div>
              <p className="text-xl text-gray-700">Jobs Completed</p>
            </div>
            <div className="flex flex-col items-center">
              <motion.div
                className="text-5xl font-extrabold text-yellow-400"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                100%
              </motion.div>
              <p className="text-xl text-gray-700">Satisfaction Guarantee</p>
            </div>
          </div>
        </div>
      </section>


      {/* Testimonials */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Trusted by Thousands</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            name="Emily Wanjiru"
            role="Small Business Owner"
            review="JuaKazi transformed how I find reliable contractors!"
            rating={5}
          />
          <TestimonialCard
            name="Michael Ochieng"
            role="Freelance Professional"
            review="More opportunities, seamless connections."
            rating={4}
          />
          <TestimonialCard
            name="Sarah Mutua"
            role="Homeowner"
            review="Quick, safe, and incredibly convenient service platform."
            rating={5}
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }) {
  return (
    <motion.div
      className="bg-white p-8 rounded-xl shadow-lg text-center hover:shadow-xl transition-all"
      whileHover={{ scale: 1.05 }}
    >
      <Icon size={48} className="mx-auto mb-6 text-blue-500" />
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
}

function WorkStep({ icon: Icon, title, description }) {
  return (
    <div className="bg-gray-50 p-8 rounded-xl text-center">
      <Icon size={48} className="mx-auto mb-6 text-green-500" />
      <h3 className="text-2xl font-bold mb-4">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function TestimonialCard({ name, role, review, rating }) {
  return (
    <motion.div
      className="bg-white p-8 rounded-xl shadow-lg"
      whileHover={{ scale: 1.05 }}
    >
      <p className="italic text-gray-600 mb-6">"{review}"</p>
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-bold">{name}</h4>
          <p className="text-sm text-gray-500">{role}</p>
        </div>
        <div className="flex text-yellow-400">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} size={20} fill="currentColor" />
          ))}
        </div>
      </div>
    </motion.div>
  );
}