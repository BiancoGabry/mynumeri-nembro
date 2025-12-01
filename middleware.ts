import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        // You can add additional middleware logic here
        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Return true if user is authenticated
                return !!token;
            },
        },
        pages: {
            signIn: "/", // Redirect to login page if not authenticated
        },
    }
);

// Protect these routes (display is now public)
export const config = {
    matcher: [
        "/manager/:path*",
        "/settings/:path*",
    ],
};
