import { data, Form, redirect, useNavigation } from "react-router";
import { createClient } from "~/supabase.server";
import { validateEmail, validatePassword } from "~/validation";
import { commitSession, getSession, setSuccessMessage } from "~/session.server";
import { useState } from "react";
import { Mail, Lock, Loader2, LogIn, Eye, EyeOff } from "lucide-react";

export async function action({ request }) {
  let { supabase, headers } = createClient(request);
  let formData = await request.formData();
  let session = await getSession(request.headers.get("Cookie"));

  let email = formData.get("email");
  let password = formData.get("password");

  let fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return data({ fieldErrors }, { status: 400 });
  }

  let { data: userData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  let userEmail = userData.user?.email;

  if (userEmail) {
    setSuccessMessage(session, "Logged in successfully!");
  }

  let allHeaders = {
    ...Object.fromEntries(headers.entries()),
    "Set-Cookie": await commitSession(session),
  };

  return redirect("/", {
    headers: allHeaders,
  });
}

export default function Login({ actionData }: { actionData: any }) {
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Form Section */}
        <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Please sign in to your account
              </p>
            </div>

            <Form method="post" className="mt-8 space-y-6">
              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email address
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="off"
                      className={`block w-full pl-10 pr-3 py-2 border ${
                        actionData?.fieldErrors?.email 
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } rounded-lg shadow-sm`}
                    />
                  </div>
                  {actionData?.fieldErrors?.email && (
                    <p className="mt-2 text-sm text-red-600">
                      {actionData.fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label 
                    htmlFor="password" 
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      autoComplete="off"
                      className={`block w-full pl-10 pr-10 py-2 border ${
                        actionData?.fieldErrors?.password 
                          ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500" 
                          : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                      } rounded-lg shadow-sm`}
                    />
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
                  </div>
                  {actionData?.fieldErrors?.password && (
                    <p className="mt-2 text-sm text-red-600">
                      {actionData.fieldErrors.password}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50"
                >
                  <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                    {isSubmitting ? (
                      <Loader2 className="h-5 w-5 text-blue-300 animate-spin" />
                    ) : (
                      <LogIn className="h-5 w-5 text-blue-300" />
                    )}
                  </span>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </button>
              </div>
            </Form>
          </div>
        </div>

        {/* Image Section */}
        <div className="hidden lg:block relative flex-1">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 opacity-90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-8">
              <h2 className="text-4xl font-bold mb-4">Welcome Back!</h2>
              <p className="text-lg text-blue-100">
                Sign in to access your account and continue your journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}