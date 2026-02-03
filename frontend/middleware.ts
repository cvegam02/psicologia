import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    );
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    // If user is NOT signed in and the current path is NOT /login, redirect to /login
    /* DEV MODE: Auth check disabled
    if (!session && !request.nextUrl.pathname.startsWith('/login')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }
    */

    // If user IS signed in and attempts to go to /login, redirect to /
    if (session && request.nextUrl.pathname.startsWith('/login')) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = '/';
        return NextResponse.redirect(redirectUrl);
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
