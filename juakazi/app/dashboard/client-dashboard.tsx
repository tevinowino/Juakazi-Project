import { useLoaderData, Form, redirect } from "react-router";
import { useState } from "react";
import { getUserData } from "~/hooks/getUserData";
import { getUser } from "~/supabase.server";
import { clientPromise } from "~/db.server";
import { uploadImageToCloudinary } from "~/.server/cloudinary.server";
import { parseFormData } from "@mjackson/form-data-parser";
import { Mail, Phone, MapPin, Edit3, Camera, Save, XCircle } from 'lucide-react';

export async function loader({ request }) {
    let { user } = await getUser(request);
    let supabaseId = user?.id;
    let mongoUser = await getUserData(supabaseId);
    return { user: mongoUser };
}

export async function action({ request }) {
    try {
        const client = clientPromise;
        const db = client.db("juakazi");
        const { user } = await getUser(request);
        const supabaseId = user?.id;
        if (!supabaseId) {
            return new Response("User not authenticated", { status: 401 });
        }
        const mongoUser = await getUserData(supabaseId);
        const originalAvatarUrl = mongoUser?.avatar || "/placeholder-pfp.jpg";
        
        const uploadHandler = async (fileUpload) => {
            if (fileUpload.fieldName === "avatar" && fileUpload.stream) {
                try {
                    const img = await uploadImageToCloudinary(fileUpload.stream());
                    return img.secure_url;
                } catch {
                    return originalAvatarUrl;
                }
            }
            return originalAvatarUrl;
        };
        
        const formData = await parseFormData(request, uploadHandler);
        const fullName = formData.get("fullName");
        const phone = formData.get("phone");
        const location = formData.get("location");
        const avatar = formData.get("avatar");
        
        const updateFields = { fullName, phone, location };
        if (avatar && avatar !== originalAvatarUrl) {
            updateFields.avatar = avatar;
        }
        
        const updateResult = await db.collection("users").updateOne({ supabaseId }, { $set: updateFields });
        if (updateResult.matchedCount === 0) {
            return new Response("User not found", { status: 404 });
        }
        return redirect("/dashboard");
    } catch {
        return new Response("Failed to update profile", { status: 500 });
    }
}

export default function ClientDashboard() {
    const { user } = useLoaderData();
    const [isEditing, setIsEditing] = useState(false);
    const [previewImage, setPreviewImage] = useState(user.avatar);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreviewImage(reader.result);
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-8">
            <div className="relative group">
                <div className="flex flex-col md:flex-row items-center gap-6 p-8">
                    <div className="relative">
                        <img src={user.avatar} alt="Profile" className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl" />
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-3xl font-bold text-gray-800">{user.fullName}</h2>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Mail className="text-blue-500" />
                    <span className="text-gray-600">{user.email}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <Phone className="text-blue-500" />
                    <span className="text-gray-600">{user.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                    <MapPin className="text-blue-500" />
                    <span className="text-gray-600">{user.location}</span>
                </div>
            </div>
            <div className="p-6 border-t">
                <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl">
                    <span className="flex gap-2">                    
                        <Edit3 size={20} /> Edit Profile
                    </span>
                </button>
            </div>
            {isEditing && (
                <Form method="post" encType="multipart/form-data" className="space-y-8 p-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group">
                            <img src={previewImage} alt="Profile Preview" className="w-32 h-32 rounded-full object-cover ring-4 ring-white shadow-xl" />
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer">
                                <Camera size={20} />
                                <input type="file" name="avatar" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </label>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <input type="text" name="fullName" defaultValue={user.fullName} className="w-full px-4 py-3 rounded-xl border" required placeholder="Full Name" />
                        <input type="text" name="phone" defaultValue={user.phone} className="w-full px-4 py-3 rounded-xl border" required placeholder="Phone Number" />
                        <input type="text" name="location" defaultValue={user.location} className="w-full px-4 py-3 rounded-xl border" required placeholder="Location" />
                    </div>
                    <div className="flex gap-4">
                        <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-xl">
                            <Save size={20} /> Save Changes
                        </button>
                        <button type="button" onClick={() => setIsEditing(false)} className="bg-red-600 text-white px-6 py-3 rounded-xl">
                            <XCircle size={20} /> Cancel
                        </button>
                    </div>
                </Form>
            )}
        </div>
    );
}
