(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__f2b15f93._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/index.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@supabase/ssr/dist/module/createServerClient.js [middleware-edge] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$api$2f$server$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/api/server.js [middleware-edge] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/esm/server/web/exports/index.js [middleware-edge] (ecmascript)");
;
;
async function middleware(request) {
    let response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
        request: {
            headers: request.headers
        }
    });
    // Skip Supabase auth checks if credentials are not configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
        // Allow public pages to work without Supabase
        const publicPaths = [
            '/',
            '/about',
            '/academics',
            '/admissions',
            '/contact',
            '/gallery',
            '/news',
            '/events',
            '/payments'
        ];
        const isPublicPath = publicPaths.some((path)=>request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith('/_next'));
        // Redirect portal routes to login with a message that auth is not configured
        if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/teacher') || request.nextUrl.pathname.startsWith('/parent') || request.nextUrl.pathname.startsWith('/student')) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/login?error=auth_not_configured', request.url));
        }
        return response;
    }
    const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$ssr$2f$dist$2f$module$2f$createServerClient$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["createServerClient"])(supabaseUrl, supabaseAnonKey, {
        cookies: {
            get (name) {
                return request.cookies.get(name)?.value;
            },
            set (name, value, options) {
                request.cookies.set({
                    name,
                    value,
                    ...options
                });
                response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request: {
                        headers: request.headers
                    }
                });
                response.cookies.set({
                    name,
                    value,
                    ...options
                });
            },
            remove (name, options) {
                request.cookies.set({
                    name,
                    value: '',
                    ...options
                });
                response = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].next({
                    request: {
                        headers: request.headers
                    }
                });
                response.cookies.set({
                    name,
                    value: '',
                    ...options
                });
            }
        }
    });
    const { data: { session } } = await supabase.auth.getSession();
    // Get user profile with role if session exists
    let userRole = null;
    if (session) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        userRole = profile?.role || null;
    }
    // Protect portal routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
        if (!session || userRole !== 'admin') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login?redirect=/admin', request.url));
        }
    }
    if (request.nextUrl.pathname.startsWith('/teacher')) {
        if (!session || userRole !== 'teacher') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login?redirect=/teacher', request.url));
        }
    }
    if (request.nextUrl.pathname.startsWith('/parent')) {
        if (!session || userRole !== 'parent') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login?redirect=/parent', request.url));
        }
    }
    if (request.nextUrl.pathname.startsWith('/student')) {
        if (!session || userRole !== 'student') {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL('/auth/login?redirect=/student', request.url));
        }
    }
    // Redirect authenticated users away from auth pages
    if (request.nextUrl.pathname.startsWith('/auth') && session) {
        // Redirect to appropriate dashboard based on role
        const dashboards = {
            admin: '/admin',
            teacher: '/teacher',
            parent: '/parent',
            student: '/student'
        };
        const redirectUrl = userRole ? dashboards[userRole] || '/' : '/';
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$esm$2f$server$2f$web$2f$exports$2f$index$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["NextResponse"].redirect(new URL(redirectUrl, request.url));
    }
    return response;
}
const config = {
    matcher: [
        /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */ '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__f2b15f93._.js.map