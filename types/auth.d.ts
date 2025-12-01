import { DefaultSession, DefaultUser } from "next-auth";
import { JWT, DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session extends DefaultSession {
        user: {
            username: string;
            role: string;
        };
        accessToken: string;
    }

    interface User extends DefaultUser {
        username: string;
        role: string;
        accessToken: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT extends DefaultJWT {
        username: string;
        role: string;
        accessToken: string;
        accessTokenExpires: number;
    }
}

export interface LoginResponse {
    user: {
        username: string;
        role: string;
    };
    accessToken: string;
}

export interface RefreshResponse {
    accessToken: string;
}

export interface ApiError {
    message: string;
}
