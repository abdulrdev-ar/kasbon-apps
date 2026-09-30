import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const AUTH_PAGES = ["/login", "/signup"]

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
      },
    },
  })

  // getClaims() verifies the JWT and refreshes the session cookie when it is expired.
  const { data } = await supabase.auth.getClaims()
  const loggedIn = Boolean(data?.claims)
  const { pathname } = request.nextUrl

  // API routes answer 401 themselves instead of redirecting.
  if (pathname.startsWith("/api")) return response

  const onAuthPage = AUTH_PAGES.includes(pathname)
  if (!loggedIn && !onAuthPage) return NextResponse.redirect(new URL("/login", request.url))
  if (loggedIn && onAuthPage) return NextResponse.redirect(new URL("/", request.url))

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
