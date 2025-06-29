import type { User } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type CookieToSet = {
  name: string;
  value: string;
  options?: Record<string, any>;
};

export async function updateSession(
  request: NextRequest
): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      cookies: {
        getAll() {
          // Return all cookies from the incoming request
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Avoid any logic between createServerClient and getUser!
  const {
    data: { user },
  }: { data: { user: User | null } } = await supabase.auth.getUser();

  // Get the domain/host from the request headers
  const domain = request.headers.get("host");
  const licenseKey = process.env.LICENSE_KEY;

  // Make the license check API call
  await fetch(`${process.env.SERVER_URL}/license/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "soullve-license-key": licenseKey || "", // Use the license key from environment variables
      "soullve-supabase-url": process.env.NEXT_PUBLIC_SUPABASE_URL || "", // Pass the Supabase URL
      "soullve-supabase-anon-key":
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "", // Pass the Supabase anon key
      "soullve-host-name": domain || "", // Pass the domain from the request headers
    },
  });

  // --- Redirection logic ---
  if (!user && request.nextUrl.pathname.startsWith("/session")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (
    user?.user_metadata?.designation === "patient" &&
    request.nextUrl.pathname === "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/session";
    return NextResponse.redirect(url);
  }

  if (
    user?.user_metadata?.designation === "therapist" &&
    request.nextUrl.pathname === "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/provider";
    return NextResponse.redirect(url);
  }

  if (
    user?.user_metadata?.designation === "therapist" &&
    request.nextUrl.pathname === "/session"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/provider";
    return NextResponse.redirect(url);
  }

  if (
    user?.user_metadata?.designation === "patient" &&
    request.nextUrl.pathname === "/provider"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/session";
    return NextResponse.redirect(url);
  }

  if (user && request.nextUrl.pathname === "/get-started") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Return the supabaseResponse as required
  return supabaseResponse;
}
