import { useState } from 'react';
import {
    CheckCircle,
    MapPin,
    Tag,
    DollarSign,
    Calendar,
    UserCircle,
    Mail,
    Phone,
    Briefcase
} from "lucide-react";
import { Form, Link, useLoaderData, useParams } from "react-router";
import { clientPromise } from '~/db.server';
import { stringFromBase64URL } from '@supabase/ssr';
import { ObjectId } from 'mongodb';

export async function loader({ params }) {
    const { jobId } = params;
    const jobIdString = String(jobId);
    console.log(jobIdString);

    let client = clientPromise;
    let db = client.db("juakazi");

    // If jobId is supposed to be an ObjectId, convert it
    const job = await db.collection("jobs").findOne({ _id: new ObjectId(jobIdString) });
    console.log(job);
    return { jobDetails: job };
}

export default function JobApplicationForm() {
    let {jobDetails} = useLoaderData();

    // const jobDetails = {
    //     title: "Web Development Project",
    //     description: "Looking for a skilled web developer to create a responsive e-commerce platform with modern React technologies.",
    //     category: "Web Development",
    //     location: "Nairobi, Kenya",
    //     budget: 150000,
    //     createdAt: new Date()
    // };


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <div className="bg-white shadow-2xl rounded-2xl w-full max-w-5xl grid md:grid-cols-2 overflow-hidden">
                {/* Job Details Section */}
                <div className="bg-blue-50 p-8 space-y-6">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{jobDetails.title}</h2>
                    <p className="text-gray-600 mb-6">{jobDetails.description}</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Tag className="w-6 h-6 text-blue-500" />
                            <span><strong>Category:</strong> {jobDetails.category}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin className="w-6 h-6 text-green-500" />
                            <span><strong>Location:</strong> {jobDetails.location}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <DollarSign className="w-6 h-6 text-purple-500" />
                            <span><strong>Budget:</strong> Ksh {Number(jobDetails.budget).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Calendar className="w-6 h-6 text-orange-500" />
                            <span><strong>Posted:</strong> {jobDetails.createdAt}</span>
                        </div>
                    </div>
                </div>

                {/* Application Form Section */}
                <div className="p-8 space-y-6">
                    <h3 className="text-2xl font-bold text-center text-gray-800 mb-6">Submit Your Application</h3>
                    <Form className="space-y-5">
                        <div className="relative">
                            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                required
                            />
                        </div>

                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="number"
                                name="expectedPay"
                                placeholder="Expected Pay (Ksh)"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <textarea
                                name="coverLetter"
                                placeholder="Cover Letter"
                                className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 transition min-h-[120px]"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition duration-300 ease-in-out transform hover:scale-102"
                        >
                            <CheckCircle className="w-5 h-5" /> Submit Application
                        </button>
                    </Form>

                    <div className="text-center">
                        <Link
                            to="/jobs"
                            className="text-gray-600 hover:text-gray-800 flex items-center justify-center gap-2 mt-4 transition"
                        >
                            Back to Jobs
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}