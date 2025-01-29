import { useLoaderData, Form, redirect } from "react-router";
import { useState } from "react";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";
import { clientPromise } from "~/db.server";
import { uploadImageToCloudinary } from "~/.server/cloudinary.server";
import { parseFormData } from "@mjackson/form-data-parser";
import { Mail, Phone, MapPin, Edit3, Plus, X, Camera, Briefcase, Save, XCircle } from 'lucide-react';

export async function loader({ request }) {
    let { user } = await getUser(request);
    let supabaseId = user?.id;
    let mongoUser = await getUserData(supabaseId);
    return { user: mongoUser };
}

export async function action({ request }) {
    try {
        console.log("Setting up MongoDB client...");
        const client = clientPromise; // MongoDB client
        const db = client.db("juakazi"); // Use the 'juakazi' database

        console.log("Retrieving user from request...");
        const { user } = await getUser(request); // Assuming this function gets the authenticated user
        const supabaseId = user?.id;

        if (!supabaseId) {
            console.error("User not authenticated.");
            return new Response("User not authenticated", { status: 401 });
        }

        console.log("User authenticated, Supabase ID: ", supabaseId);

        // Step 3: Retrieve MongoDB user data
        console.log("Fetching user data from MongoDB...");
        const mongoUser = await getUserData(supabaseId);
        const originalAvatarUrl = mongoUser?.avatar || "/placeholder-pfp.jpg"; // Default avatar URL if none found
        console.log("Original Avatar URL: ", originalAvatarUrl);

        // Step 4: Set up file upload handler (for avatar)
        const uploadHandler = async (fileUpload) => {
            console.log("Handling file upload...");
            if (fileUpload.fieldName === "avatar" && fileUpload.stream) {
                try {
                    const img = await uploadImageToCloudinary(fileUpload.stream());
                    console.log("Avatar uploaded to Cloudinary. URL: ", img.secure_url);
                    return img.secure_url; // Return the URL of the uploaded image
                } catch (uploadError) {
                    console.error("Error uploading image to Cloudinary: ", uploadError);
                    return originalAvatarUrl; // In case of upload failure, return the original avatar
                }
            }
            return originalAvatarUrl; // If not an avatar file, return the original avatar
        };

        // Step 5: Parse form data, including file upload
        console.log("Parsing form data...");
        const formData = await parseFormData(request, uploadHandler);
        const fullName = formData.get("fullName");
        const phone = formData.get("phone");
        const location = formData.get("location");
        const services = formData.getAll("services");
        const avatar = formData.get("avatar");

        console.log("Parsed form data: ", { fullName, phone, location, services, avatar });

        // Step 6: Update MongoDB user data
        console.log("Preparing update for user data in MongoDB...");
        const updateFields = { fullName, phone, location, services };

        // Only update avatar if it has changed
        if (avatar && avatar !== originalAvatarUrl) {
            updateFields.avatar = avatar;
        }

        console.log("Update fields: ", updateFields);

        // Step 7: Perform the MongoDB update
        console.log("Updating user data in MongoDB...");
        const updateResult = await db.collection("users").updateOne({ supabaseId }, { $set: updateFields });

        if (updateResult.matchedCount === 0) {
            console.error("No user found with the provided Supabase ID.");
            return new Response("User not found", { status: 404 });
        }

        console.log("User data updated successfully.");

        // Step 8: Redirect the user to the dashboard after successful update
        return redirect("/dashboard");

    } catch (error) {
        console.error("Error during action execution: ", error);
        return new Response("Failed to update profile", { status: 500 });
    }
}

export default function WorkerDashboard() {
    const { user } = useLoaderData();
    const [isEditing, setIsEditing] = useState(false);
    const [services, setServices] = useState(user.services || []);
    const [newService, setNewService] = useState("");
    const [previewImage, setPreviewImage] = useState(user.avatar);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const addService = () => {
        if (newService.trim()) {
            setServices([...services, newService.trim()]);
            setNewService("");
        }
    };

    const removeService = (indexToRemove: number) => {
        setServices(services.filter((_: any, index: number) => index !== indexToRemove));
    };

    const ViewMode = () => (
        <div className="space-y-8">
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-blue-600/20 rounded-t-3xl -z-10" />
                <div className="flex flex-col md:flex-row items-center gap-6 p-8">
                    <div className="relative">
                        <img
                            src={user.avatar}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                        />
                        <div className="absolute -bottom-2 right-0 bg-blue-500 text-white p-2 rounded-full">
                            <Briefcase size={20} />
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">{user.fullName}</h2>
                        <p className="text-blue-600 font-medium capitalize mt-1">{user.role}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <Mail className="text-blue-500" />
                    <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <Phone className="text-blue-500" />
                    <span className="text-gray-600">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                    <MapPin className="text-blue-500" />
                    <span className="text-gray-600">{user.location}</span>
                </div>
            </div>

            <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Services</h3>
                <div className="flex flex-wrap gap-3">
                    {services.map((service: string, index: number) => (
                        <span
                            key={index}
                            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-medium hover:bg-blue-100 transition"
                        >
                            {service}
                        </span>
                    ))}
                </div>
            </div>

            <div className="p-6 border-t">
                <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300 mx-auto"
                >
                    <Edit3 size={20} />
                    Edit Profile
                </button>
            </div>
        </div>
    );

    const EditMode = () => (
        <Form method="post" encType="multipart/form-data" className="space-y-8 p-6">
            <input type="hidden" name="supabaseId" value={user.supabaseId} />

            <div className="flex flex-col items-center gap-4">
                <div className="relative group">
                    <img
                        src={previewImage}
                        alt="Profile Preview"
                        className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl"
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                        <Camera size={20} />
                        <input
                            placeholder="Avatar"
                            type="file"
                            name="avatar"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </label>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <input
                        type="text"
                        name="fullName"
                        defaultValue={user.fullName}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        required
                        placeholder="Full Name"
                    />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        name="phone"
                        defaultValue={user.phone}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        required
                        placeholder="Phone Number"
                    />
                </div>
                <div className="relative">
                    <input
                        type="text"
                        name="location"
                        defaultValue={user.location}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        required
                        placeholder="Location"
                    />
                </div>
            </div>

            <div className="flex gap-5">
                <div className="relative">
                    <input
                        type="text"
                        value={newService}
                        onChange={(e) => setNewService(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                        placeholder="Add New Service"
                    />
                </div>
                <button
                    title="Add Service"
                    type="button"
                    onClick={addService}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition duration-300"
                >
                    <Plus size={20} />
                </button>
            </div>

            <div className="space-y-2 ">
                {services.map((service: string, index: number) => (
                    <div key={index} className="flex items-center gap-2 bg-blue-700 w-fit px-2 py-1 rounded-full text-white hover:px-3 transition-all duration-200">
                        <input type="hidden" name="services" value={service} key={index} />
                        <span>{service}</span>             
                        <button
                            title="Remove Service"
                            type="button"
                            onClick={() => removeService(index)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <XCircle size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="space-x-4 text-center mt-6">
                <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition duration-300"
                >
                    <span className="flex items-center gap-2">
                        <Save size={20} />
                        Save Changes
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition duration-300"
                >
                    <span className="flex items-center gap-2">
                        <X size={20} />
                        Cancel

                    </span>
                </button>
            </div>
        </Form>
    );

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Worker Dashboard</h1>
            {isEditing ? EditMode() : ViewMode()}
        </div>
    );
}
