import {
  createServerClient,
  parseCookieHeader,
  serializeCookieHeader,
} from "@supabase/ssr";

export function createClient(request: Request) {
  let headers = new Headers();

  const supabase = createServerClient(
    process.env.SUPABASE_PROJECT_URL!,
    process.env.SUPABASE_PUBLIC_API_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            headers.append(
              "Set-Cookie",
              serializeCookieHeader(name, value, options)
            )
          );
        },
      },
    }
  );

  return { supabase, headers };
}

export async function getUser(request: Request) {
  const { supabase } = createClient(request);

  try {
    const { data: { user } } = await supabase.auth.getUser(); 
    return { user };
  } catch (error) {
    console.error("Error fetching user:", error);
    return { user: null }; // Return null or handle error appropriately
  }
}