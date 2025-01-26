import { Form, redirect, useNavigation } from "react-router";
import { validateEmail, validatePassword } from "~/validation";
import { createClient } from "~/supabase.server";
import { commitSession, getSession, setSuccessMessage } from "~/session.server";
import { clientPromise } from "~/db.server";
import {
  type FileUpload,
  parseFormData,
} from "@mjackson/form-data-parser";
import { uploadImageToCloudinary } from "~/.server/cloudinary.server";


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
      // let uuid = crypto.randomUUID();
      // let storageKey = getStorageKey(uuid);
      // await fileStorage.set(storageKey, fileUpload)
      // return fileStorage.get(storageKey)
      let img = await uploadImageToCloudinary(fileUpload.stream());
      return img.secure_url;
    }
  };

  const formData = await parseFormData(
    request,
    uploadHandler
  );

  // Get form data
  // let formData = await request.formData();
  let fullName = String(formData.get("fullName")).trim();
  let email = String(formData.get("email")).trim();
  let password = String(formData.get("password"));
  let phone = String(formData.get("phone")).trim();
  let location = String(formData.get("location")).trim();
  let role = String(formData.get("role")) || "client";
  let avatar = formData.get("avatar");

console.log({avatar})

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
  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";

  return (
    <main className="grid lg:grid-cols-2 gap-8 lg:gap-12 lg:h-screen px-6 xl:max-w-6xl mx-auto">
      <div className="lg:self-center">
        <h1 className="text-4xl font-semibold">Signup</h1>
        <Form method="post" className="mt-8 space-y-4" encType="multipart/form-data">
          {['fullName', 'email', 'password', 'phone', 'location'].map((field) => (
            <div key={field}>
              <label htmlFor={field}>
                {field.charAt(0).toUpperCase() + field.slice(1)}
                {actionData?.fieldErrors?.[field] && (
                  <span className="text-red-500"> {actionData.fieldErrors[field]}</span>
                )}
              </label>
              <input
                type={field === 'password' ? 'password' : 'text'}
                name={field}
                id={field}
                autoComplete="off"
                className={`px-4 py-2 rounded-md block mt-2 w-full border ${
                  actionData?.fieldErrors?.[field] ? "border-red-500" : ""
                }`}
              />
            </div>
          ))}

          <div>
            <label htmlFor="role">I am a:</label>
            <select
              name="role"
              id="role"
              className="px-4 py-2 rounded-md block mt-2 w-full border"
            >
              <option value="client">Client (Hiring Workers)</option>
              <option value="worker">Worker (Offering Services)</option>
            </select>
          </div>
          <div>
            <label htmlFor="avatar">Avatar</label>
            <input type="file" name="avatar" id="avatar" accept="image/*" className="px-4 py-2 rounded-md block mt-2 w-full border" />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`bg-green-500 hover:bg-green-700 transition px-4 py-2 rounded-md active:scale-[.97] ${
              isSubmitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Signing up..." : "Sign Up"}
          </button>
        </Form>
      </div>
    </main>
  );
}
