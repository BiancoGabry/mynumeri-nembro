import type { NextAuthOptions, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "./api-client";
import { JWT } from "next-auth/jwt";

// Access token expires in 15 minutes according to swagger docs
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes in milliseconds

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Username e password sono obbligatori");
                }

                try {
                    const response = await apiClient.login(
                        credentials.username,
                        credentials.password
                    );

                    // Return user object that will be stored in JWT
                    return {
                        id: response.user.username, // NextAuth requires id field
                        username: response.user.username,
                        role: response.user.role,
                        accessToken: response.accessToken,
                    };
                } catch (error) {
                    console.error("Login error:", error);
                    throw new Error(
                        error instanceof Error ? error.message : "Errore durante il login"
                    );
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger }): Promise<JWT> {
            // Initial sign in
            if (user) {
                token.username = user.username;
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.accessTokenExpires = Date.now() + ACCESS_TOKEN_LIFETIME;
                return token;
            }

            // Return previous token if access token has not expired yet
            if (Date.now() < (token.accessTokenExpires as number)) {
                return token;
            }

            // Access token has expired, try to refresh it
            try {
                const refreshedToken = await apiClient.refreshAccessToken();
                return {
                    ...token,
                    accessToken: refreshedToken.accessToken,
                    accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME,
                };
            } catch (error) {
                console.error("Failed to refresh access token:", error);
                // Return token with error flag to trigger re-authentication
                return {
                    ...token,
                    error: "RefreshAccessTokenError",
                };
            }
        },
        async session({ session, token }) {
            // Send properties to the client
            session.user = {
                username: token.username as string,
                role: token.role as string,
            };
            session.accessToken = token.accessToken as string;

            return session;
        },
    },
    pages: {
        signIn: "/", // Login page route
    },
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days (matching refresh token lifetime)
    },
    secret: process.env.NEXTAUTH_SECRET,
};
