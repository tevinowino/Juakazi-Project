import { data, Form, redirect, useNavigation } from "react-router";
import { createClient } from "~/supabase.server";
import { validateEmail, validatePassword } from "~/validation";
import { commitSession, getSession, setSuccessMessage } from "~/session.server";

export async function action({ request }) {
  let { supabase, headers } = createClient(request);

  let formData = await request.formData();
  let session = await getSession(request.headers.get("Cookie"));

  let email = formData.get("email");
  let password = formData.get("password");

  // Validate and return errors if any

  let fieldErrors = {
    email: validateEmail(email),
    password: validatePassword(password),
  };

  if (Object.values(fieldErrors).some(Boolean)) {
    return data({ fieldErrors }, { status: 400 });
  }

  // Sign in

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

export default function Login({ actionData }: Route.ComponentProps) {
  let navigation = useNavigation();
  let isSubmitting = navigation.state === "submitting";
  return (
    <main className="grid lg:grid-cols-2 gap-8 lg:gap-12 lg:h-screen px-6 xl:max-w-6xl mx-auto">
      <div className="lg:self-center">
        <h1 className="text-4xl font-semibold">Login</h1>
        <Form method="post" className="mt-8 space-y-4">
          <div>
            <label htmlFor="email">
              Email{" "}
              {actionData?.fieldErrors?.email ? (
                <span className="text-red-500">
                  {actionData.fieldErrors.email}
                </span>
              ) : null}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              autoComplete="off"
              className={`px-4 py-2 rounded-md block mt-2 w-full border ${
                actionData?.fieldErrors?.email ? "border-red-500" : ""
              }`}
            />
          </div>

          <div>
            <label htmlFor="password">
              Password{" "}
              {actionData?.fieldErrors?.password ? (
                <span className="text-red-500">
                  {actionData.fieldErrors.password}
                </span>
              ) : null}
            </label>
            <input
              type="password"
              name="password"
              id="password"
              autoComplete="off"
              className={`px-4 py-2 rounded-md block mt-2 w-full border ${
                actionData?.fieldErrors?.password ? "border-red-500" : ""
              }`}
            />
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-700 transition ease-in-out duration-300 px-4 py-2 rounded-md active:scale-[.97]"
          >
            {isSubmitting ? "Logging in..." : "Log In"}
          </button>
        </Form>
      </div>
      <div>
        <img
          src="https://images.unsplash.com/photo-1463171379579-3fdfb86d6285?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="A person using a computer"
          className="w-full h-full rounded-lg object-cover"
        />
      </div>
    </main>
  );
}
