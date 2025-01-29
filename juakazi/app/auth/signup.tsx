import { Form, redirect, useNavigation } from "react-router";
import { validateEmail, validatePassword } from "~/validation";
import { createClient } from "~/supabase.server";
import { commitSession, getSession, setSuccessMessage } from "~/session.server";
import { clientPromise } from "~/db.server";
import { type FileUpload, parseFormData } from "@mjackson/form-data-parser";
import { uploadImageToCloudinary } from "~/.server/cloudinary.server";
import { useState } from "react";
import { 
  User, 
  Mail, 
  Lock, 
  Phone, 
  MapPin, 
  Briefcase, 
  Upload, 
  Loader2, 
  Eye, 
  EyeOff 
} from "lucide-react";

interface FieldError {
  email?: string;
  password?: string;
  phone?: string;
  fullName?: string;
  location?: string;
}

export async function action({ request }) {
  let session = await getSession(request.headers.get("Cookie"));
  let client = clientPromise;
  let db = client.db("juakazi");

  const uploadHandler = async (fileUpload: FileUpload) => {
    if (fileUpload.fieldName === "avatar") {
      let img = await uploadImageToCloudinary(fileUpload.stream());
      if (!img) {
        let defaultImage = "/placeholder-pfp.jpg";
        return defaultImage;
      }
      return img.secure_url;
    }
  };

  const formData = await parseFormData(request, uploadHandler);

  let fullName = String(formData.get("fullName")).trim();
  let email = String(formData.get("email")).trim();
  let password = String(formData.get("password"));
  let phone = String(formData.get("phone")).trim();
  let location = String(formData.get("location")).trim();
  let role = String(formData.get("role")) || "client";
  let avatar = formData.get("avatar");

  let fieldErrors: FieldError = {
    email: validateEmail(email),
    password: validatePassword(password),
    phone: phone ? undefined : "Phone number is required.",
    fullName: fullName ? undefined : "Full name is required.",
    location: location ? undefined : "Location is required.",
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return { fieldErrors };
  }

  const existingUser = await db.collection("users").findOne({ email });
  if (existingUser) {
    return { fieldErrors: { email: "Email already in use" } };
  }

  let { supabase, headers } = createClient(request);
  let { data: userData, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    return { formError: error.message };
  }

  const result = await db.collection("users").insertOne({
    fullName,
    phone,
    location,
    role,
    email,
    supabaseId: userData?.user?.id,
    avatar,
    created_at: new Date(),
  });

  if (!result.acknowledged) {
    return { formError: "Database error: Failed to store user data." };
  }

  setSuccessMessage(session, "Check your email to verify your account!");
  let allHeaders = {
    ...Object.fromEntries(headers.entries()),
    "Set-Cookie": await commitSession(session),
  };

  throw redirect("/check-email", { headers: allHeaders });
}

export default function Signup({ actionData }) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showPassword, setShowPassword] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const formFields = [
    { name: 'fullName', icon: User, type: 'text', placeholder: 'Enter your full name' },
    { name: 'email', icon: Mail, type: 'email', placeholder: 'Enter your email address' },
    { name: 'password', icon: Lock, type: 'password', placeholder: 'Choose a strong password' },
    { name: 'phone', icon: Phone, type: 'tel', placeholder: 'Enter your phone number' },
    { name: 'location', icon: MapPin, type: 'text', placeholder: 'Enter your location' },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
          <div className="w-full max-w-xl space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Create your account
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Join our community and start your journey
              </p>
            </div>

            <Form 
              method="post" 
              className="mt-8 space-y-6"
              encType="multipart/form-data"
            >
              <div className="space-y-4">
                {formFields.map(({ name, icon: Icon, type, placeholder }) => (
                  <div key={name}>
                    <label 
                      htmlFor={name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {name.replace(/([A-Z])/g, ' $1').trim()}
                      {actionData?.fieldErrors?.[name] && (
                        <span className="ml-2 text-sm text-red-600">
                          {actionData.fieldErrors[name]}
                        </span>
                      )}
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
                        name={name}
                        id={name}
                        placeholder={placeholder}
                        autoComplete="off"
                        className={`block w-full pl-10 pr-3 py-2 border ${
                          actionData?.fieldErrors?.[name]
                            ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        } rounded-lg`}
                      />
                      {type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <div>
                  <label 
                    htmlFor="role"
                    className="block text-sm font-medium text-gray-700"
                  >
                    I am a:
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="role"
                      id="role"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="client">Client (Hiring Workers)</option>
                      <option value="worker">Worker (Offering Services)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="avatar"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Profile Picture
                  </label>
                  <div className="mt-1 flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Profile preview"
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <label className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        name="avatar"
                        id="avatar"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {actionData?.formError && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {actionData.formError}
                      </h3>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 ease-in-out"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 text-blue-300 animate-spin" />
                  ) : (
                    <Upload className="h-5 w-5 text-blue-300" />
                  )}
                </span>
                {isSubmitting ? "Creating account..." : "Create account"}
              </button>
            </Form>
          </div>
        </div>
      </div>
    </main>
  );
}