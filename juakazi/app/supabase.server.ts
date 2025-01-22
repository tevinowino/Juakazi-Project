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
  let { supabase } = createClient(request);
  let {
    data: { user },
  } = await supabase.auth.getUser();

  return { user };
}
